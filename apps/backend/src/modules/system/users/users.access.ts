import { and, eq } from 'drizzle-orm'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import { userDepartments, userRoles, users } from '@/db/schema.js'

// 向授权等模块公开只读访问查询，调用方无需依赖用户模块的仓储实现细节。
export async function userExists(app: BackendRuntime, userId: number): Promise<boolean> {
  const [row] = await app.db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
    .limit(1)
  return Boolean(row)
}

export async function assignedRoleIds(app: BackendRuntime, userId: number): Promise<number[]> {
  const rows = await app.db
    .select({ id: userRoles.roleId })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))
  return rows.map((row) => row.id)
}

export async function assignedDepartmentIds(
  app: BackendRuntime,
  userId: number,
): Promise<number[]> {
  const rows = await app.db
    .select({ id: userDepartments.departmentId })
    .from(userDepartments)
    .where(and(eq(userDepartments.userId, userId), eq(userDepartments.isDeleted, false)))
  return rows.map((row) => row.id)
}

export async function hasActiveDepartmentMembership(
  app: BackendRuntime,
  departmentId: number,
): Promise<boolean> {
  const [row] = await app.db
    .select({ id: userDepartments.id })
    .from(userDepartments)
    .where(
      and(eq(userDepartments.departmentId, departmentId), eq(userDepartments.isDeleted, false)),
    )
    .limit(1)
  return Boolean(row)
}
