import { and, eq, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { DepartmentRequest } from '@scaffold/api-contract'
import type { Database } from '@/db/index.js'
import { departmentClosure, departments } from '@/db/schema.js'
import { hasActiveDepartmentPolicyReference } from '@/modules/authorization/authorization.references.js'
import { hasActiveDepartmentMembership } from '@/modules/users/users.access.js'
import { auditView } from '@/shared/database/pagination.js'

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]

function departmentSummary(row: typeof departments.$inferSelect) {
  return {
    id: row.id,
    parentId: row.parentId,
    code: row.code,
    name: row.name,
    sortOrder: row.sortOrder,
    enabled: row.enabled,
    ...auditView(row),
  }
}

async function rebuildDepartmentClosure(tx: Transaction, actorId: number): Promise<void> {
  // 以邻接表为事实来源重建闭包：每个节点先记录到自身 depth=0，再沿父链记录全部祖先。
  const rows = await tx
    .select({ id: departments.id, parentId: departments.parentId })
    .from(departments)
    .where(eq(departments.isDeleted, false))
  const byId = new Map(rows.map((row) => [row.id, row]))
  const paths: Array<{ ancestorId: number; descendantId: number; depth: number }> = []
  for (const row of rows) {
    paths.push({ ancestorId: row.id, descendantId: row.id, depth: 0 })
    const visited = new Set([row.id])
    let parentId = row.parentId
    let depth = 1
    while (parentId > 0) {
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

export async function listDepartments(app: FastifyInstance) {
  const rows = await app.db
    .select()
    .from(departments)
    .where(eq(departments.isDeleted, false))
    .orderBy(departments.sortOrder, departments.id)
  return rows.map(departmentSummary)
}

export async function listDepartmentOptions(app: FastifyInstance) {
  return app.db
    .select({
      id: departments.id,
      parentId: departments.parentId,
      code: departments.code,
      name: departments.name,
    })
    .from(departments)
    .where(and(eq(departments.enabled, true), eq(departments.isDeleted, false)))
    .orderBy(departments.sortOrder, departments.id)
}

export async function validateDepartmentParent(
  app: FastifyInstance,
  parentId: number,
  currentId?: number,
): Promise<boolean> {
  if (parentId === 0) {
    return true
  }
  if (parentId === currentId) {
    return false
  }
  const [parent] = await app.db
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
    const [descendant] = await app.db
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

export async function createDepartment(
  app: FastifyInstance,
  input: DepartmentRequest,
  actorId: number,
): Promise<number> {
  return app.db.transaction(async function create(tx) {
    const [created] = await tx
      .insert(departments)
      .values({ ...input, createdBy: actorId, updatedBy: actorId })
      .returning({ id: departments.id })
    await rebuildDepartmentClosure(tx, actorId)
    return created.id
  })
}

export async function updateDepartment(
  app: FastifyInstance,
  id: number,
  input: DepartmentRequest,
  actorId: number,
): Promise<boolean> {
  return app.db.transaction(async function update(tx) {
    const rows = await tx
      .update(departments)
      .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(departments.id, id), eq(departments.isDeleted, false)))
      .returning({ id: departments.id })
    if (!rows.length) {
      return false
    }
    await rebuildDepartmentClosure(tx, actorId)
    return true
  })
}

export async function canDeleteDepartment(app: FastifyInstance, id: number): Promise<boolean> {
  // 删除前同时保护树结构、用户归属和授权策略引用。
  const [child] = await app.db
    .select({ id: departments.id })
    .from(departments)
    .where(and(eq(departments.parentId, id), eq(departments.isDeleted, false)))
    .limit(1)
  if (child) {
    return false
  }
  const [membership, policyAssignment] = await Promise.all([
    hasActiveDepartmentMembership(app, id),
    hasActiveDepartmentPolicyReference(app, id),
  ])
  return !membership && !policyAssignment
}

export async function softDeleteDepartment(
  app: FastifyInstance,
  id: number,
  actorId: number,
): Promise<boolean> {
  return app.db.transaction(async function softDelete(tx) {
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
