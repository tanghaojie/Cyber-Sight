import { Inject, Injectable } from '@nestjs/common'
import { and, eq, inArray } from 'drizzle-orm'
import type { EntityId } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/foundation/database/index.js'
import { departments, positions, userPositions } from '@/foundation/database/schema.js'
import { DATABASE } from '@/foundation/shared/database/database.provider.js'

/** 岗位模块对用户模块开放的只读校验能力。岗位所属部门始终从岗位主表推导。 */
@Injectable()
export class PositionsAccess {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async enabledPositionIds(candidateIds: EntityId[]): Promise<EntityId[]> {
    if (candidateIds.length === 0) {
      return []
    }
    const rows = await this.db
      .select({ id: positions.id })
      .from(positions)
      .innerJoin(departments, eq(positions.departmentId, departments.id))
      .where(
        and(
          inArray(positions.id, candidateIds),
          eq(positions.enabled, true),
          eq(positions.isDeleted, false),
          eq(departments.enabled, true),
          eq(departments.isDeleted, false),
        ),
      )
    return rows.map((row) => row.id)
  }

  /** 校验岗位均启用且岗位所属部门包含在用户最终部门集合中。 */
  async positionAssignmentsAreValid(
    positionIds: EntityId[],
    departmentIds: EntityId[],
  ): Promise<boolean> {
    if (positionIds.length === 0) {
      return true
    }
    const rows = await this.db
      .select({ id: positions.id, departmentId: positions.departmentId })
      .from(positions)
      .innerJoin(departments, eq(positions.departmentId, departments.id))
      .where(
        and(
          inArray(positions.id, positionIds),
          eq(positions.enabled, true),
          eq(positions.isDeleted, false),
          eq(departments.enabled, true),
          eq(departments.isDeleted, false),
        ),
      )
    const departmentSet = new Set(departmentIds)
    return (
      rows.length === new Set(positionIds).size &&
      rows.every((row) => departmentSet.has(row.departmentId))
    )
  }

  /** 返回用户当前真正生效的岗位关联，停用岗位和失效部门不会出现在用户摘要中。 */
  async activePositionAssignments(
    userIds: EntityId[],
  ): Promise<Array<{ userId: EntityId; positionId: EntityId }>> {
    if (userIds.length === 0) {
      return []
    }
    return this.db
      .select({ userId: userPositions.userId, positionId: userPositions.positionId })
      .from(userPositions)
      .innerJoin(positions, eq(userPositions.positionId, positions.id))
      .innerJoin(departments, eq(positions.departmentId, departments.id))
      .where(
        and(
          inArray(userPositions.userId, userIds),
          eq(userPositions.isDeleted, false),
          eq(positions.enabled, true),
          eq(positions.isDeleted, false),
          eq(departments.enabled, true),
          eq(departments.isDeleted, false),
        ),
      )
  }
}
