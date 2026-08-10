import { Inject, Injectable } from '@nestjs/common'
import { and, eq, or } from 'drizzle-orm'
import type { DepartmentRequest, EntityId } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/db/index.js'
import {
  dataPolicyDepartments,
  departmentClosure,
  departments,
  userDepartments,
} from '@/db/schema.js'
import { DATABASE } from '@/shared/database/database.provider.js'
import { auditView } from '@/shared/database/pagination.js'

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]

function departmentSummary(row: typeof departments.$inferSelect) {
  return {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    sortOrder: row.sortOrder,
    enabled: row.enabled,
    ...auditView(row),
  }
}

@Injectable()
export class DepartmentsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  private async rebuildDepartmentClosure(tx: Transaction, actorId: EntityId): Promise<void> {
    // 以邻接表为事实来源重建闭包：每个节点先记录到自身 depth=0，再沿父链记录全部祖先。
    const rows = await tx
      .select({ id: departments.id, parentId: departments.parentId })
      .from(departments)
      .where(eq(departments.isDeleted, false))
    const byId = new Map(rows.map((row) => [row.id, row]))
    const paths: Array<{ ancestorId: EntityId; descendantId: EntityId; depth: number }> = []
    for (const row of rows) {
      paths.push({ ancestorId: row.id, descendantId: row.id, depth: 0 })
      const visited = new Set([row.id])
      let parentId = row.parentId
      let depth = 1
      while (parentId !== null) {
        // 重建阶段再次保护环和缺失父节点，避免错误层级扩散成不可用的数据范围。
        if (visited.has(parentId)) {
          throw new Error('Department hierarchy contains a cycle')
        }
        const parent = byId.get(parentId)
        if (!parent) {
          throw new Error('Department hierarchy contains a missing parent')
        }
        visited.add(parentId)
        paths.push({ ancestorId: parentId, descendantId: row.id, depth })
        parentId = parent.parentId
        depth += 1
      }
    }
    const now = new Date()
    // 整体软删除旧闭包并插入新快照，调用方事务保证业务表和闭包表同时提交。
    await tx
      .update(departmentClosure)
      .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
      .where(eq(departmentClosure.isDeleted, false))
    if (paths.length > 0) {
      await tx.insert(departmentClosure).values(
        paths.map((path) => ({
          ...path,
          createdBy: actorId,
          updatedBy: actorId,
        })),
      )
    }
  }

  async listDepartments() {
    const rows = await this.db
      .select()
      .from(departments)
      .where(eq(departments.isDeleted, false))
      .orderBy(departments.sortOrder, departments.id)
    return rows.map(departmentSummary)
  }

  async listDepartmentOptions() {
    // 选项接口只返回启用节点；禁用部门可保留在历史树中，但不能成为新的归属或策略目标。
    return this.db
      .select({ id: departments.id, parentId: departments.parentId, name: departments.name })
      .from(departments)
      .where(and(eq(departments.enabled, true), eq(departments.isDeleted, false)))
      .orderBy(departments.sortOrder, departments.id)
  }

  async validateDepartmentParent(
    parentId: EntityId | null,
    currentId?: EntityId,
  ): Promise<boolean> {
    if (parentId === null) {
      return true
    }
    if (parentId === currentId) {
      return false
    }
    const [parent] = await this.db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          eq(departments.id, parentId),
          eq(departments.enabled, true),
          eq(departments.isDeleted, false),
        ),
      )
      .limit(1)
    if (!parent) {
      return false
    }
    if (currentId) {
      // 当前节点的任一后代都不能成为新父节点，否则会形成环。
      const [descendant] = await this.db
        .select({ id: departmentClosure.id })
        .from(departmentClosure)
        .where(
          and(
            eq(departmentClosure.ancestorId, currentId),
            eq(departmentClosure.descendantId, parentId),
            eq(departmentClosure.isDeleted, false),
          ),
        )
        .limit(1)
      if (descendant) {
        return false
      }
    }
    return true
  }

  async createDepartment(input: DepartmentRequest, actorId: EntityId): Promise<EntityId> {
    // 新节点与重建后的闭包必须同事务提交，授权查询不会看到只有一半的组织树状态。
    return this.db.transaction(async (tx) => {
      const [created] = await tx
        .insert(departments)
        .values({ ...input, createdBy: actorId, updatedBy: actorId })
        .returning({ id: departments.id })
      await this.rebuildDepartmentClosure(tx, actorId)
      return created.id
    })
  }

  async updateDepartment(
    id: EntityId,
    input: DepartmentRequest,
    actorId: EntityId,
  ): Promise<boolean> {
    // 父级调整会影响整棵子树的祖先路径，因此成功更新后统一重建闭包而非尝试局部拼接。
    return this.db.transaction(async (tx) => {
      const rows = await tx
        .update(departments)
        .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
        .where(and(eq(departments.id, id), eq(departments.isDeleted, false)))
        .returning({ id: departments.id })
      if (!rows.length) {
        return false
      }
      await this.rebuildDepartmentClosure(tx, actorId)
      return true
    })
  }

  async canDeleteDepartment(id: EntityId): Promise<boolean> {
    // 删除前同时保护树结构、用户归属和授权策略引用。
    const [child] = await this.db
      .select({ id: departments.id })
      .from(departments)
      .where(and(eq(departments.parentId, id), eq(departments.isDeleted, false)))
      .limit(1)
    if (child) {
      return false
    }
    const [membership, policyAssignment] = await Promise.all([
      this.db
        .select({ id: userDepartments.id })
        .from(userDepartments)
        .where(and(eq(userDepartments.departmentId, id), eq(userDepartments.isDeleted, false)))
        .limit(1),
      this.db
        .select({ id: dataPolicyDepartments.id })
        .from(dataPolicyDepartments)
        .where(
          and(
            eq(dataPolicyDepartments.departmentId, id),
            eq(dataPolicyDepartments.isDeleted, false),
          ),
        )
        .limit(1),
    ])
    return !membership[0] && !policyAssignment[0]
  }

  async softDeleteDepartment(id: EntityId, actorId: EntityId): Promise<boolean> {
    return this.db.transaction(async (tx) => {
      const now = new Date()
      const rows = await tx
        .update(departments)
        .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
        .where(and(eq(departments.id, id), eq(departments.isDeleted, false)))
        .returning({ id: departments.id })
      if (!rows.length) {
        return false
      }
      // 叶子节点删除后，仅需失效所有以其为祖先或后代的闭包路径。
      await tx
        .update(departmentClosure)
        .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
        .where(
          and(
            eq(departmentClosure.isDeleted, false),
            or(eq(departmentClosure.ancestorId, id), eq(departmentClosure.descendantId, id)),
          ),
        )
      return true
    })
  }
}
