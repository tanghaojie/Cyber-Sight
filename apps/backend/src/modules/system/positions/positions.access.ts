import { and, eq, inArray } from 'drizzle-orm'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import { departments, positions, userPositions } from '@/db/schema.js'

/** 岗位模块对用户模块开放的只读校验能力。岗位所属部门始终从岗位主表推导。 */
export async function enabledPositionIds(
  app: BackendRuntime,
  candidateIds: number[],
): Promise<number[]> {
  if (candidateIds.length === 0) {
    return []
  }
  const rows = await app.db
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
export async function positionAssignmentsAreValid(
  app: BackendRuntime,
  positionIds: number[],
  departmentIds: number[],
): Promise<boolean> {
  if (positionIds.length === 0) {
    return true
  }
  const rows = await app.db
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
export async function activePositionAssignments(
  app: BackendRuntime,
  userIds: number[],
): Promise<Array<{ userId: number; positionId: number }>> {
  if (userIds.length === 0) {
    return []
  }
  return app.db
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
