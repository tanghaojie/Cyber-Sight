import { Inject, Injectable } from '@nestjs/common'
import { and, eq, inArray } from 'drizzle-orm'
import type { EntityId } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/foundation/database/index.js'
import { departmentClosure, departments } from '@/foundation/database/schema.js'
import { DATABASE } from '@/foundation/shared/database/database.provider.js'

// 授权和用户模块通过这些只读方法消费部门状态与闭包关系，不直接拼接部门内部查询。
@Injectable()
export class DepartmentsAccess {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async departmentExists(departmentId: EntityId): Promise<boolean> {
    const [row] = await this.db
      .select({ id: departments.id })
      .from(departments)
      .where(and(eq(departments.id, departmentId), eq(departments.isDeleted, false)))
      .limit(1)
    return Boolean(row)
  }

  async enabledDepartmentIds(candidateIds: EntityId[]): Promise<EntityId[]> {
    if (candidateIds.length === 0) {
      return []
    }
    const rows = await this.db
      .select({ id: departments.id })
      .from(departments)
      .where(
        and(
          inArray(departments.id, candidateIds),
          eq(departments.enabled, true),
          eq(departments.isDeleted, false),
        ),
      )
    return rows.map((row) => row.id)
  }

  async ancestorDepartmentIds(departmentIds: EntityId[]): Promise<EntityId[]> {
    if (departmentIds.length === 0) {
      return []
    }
    // 闭包表包含 depth=0 自身路径，因此结果既含输入部门本身，也含全部祖先。
    const rows = await this.db
      .select({ id: departmentClosure.ancestorId })
      .from(departmentClosure)
      .where(
        and(
          inArray(departmentClosure.descendantId, departmentIds),
          eq(departmentClosure.isDeleted, false),
        ),
      )
    return [...new Set(rows.map((row) => row.id))]
  }

  async descendantDepartmentIds(departmentIds: EntityId[]): Promise<EntityId[]> {
    if (departmentIds.length === 0) {
      return []
    }
    const rows = await this.db
      // 后代展开同时连接部门表，确保结果只包含当前有效部门。
      .select({ id: departmentClosure.descendantId })
      .from(departmentClosure)
      .innerJoin(
        departments,
        and(
          eq(departmentClosure.descendantId, departments.id),
          eq(departments.enabled, true),
          eq(departments.isDeleted, false),
        ),
      )
      .where(
        and(
          inArray(departmentClosure.ancestorId, departmentIds),
          eq(departmentClosure.isDeleted, false),
        ),
      )
    return [...new Set(rows.map((row) => row.id))]
  }
}
