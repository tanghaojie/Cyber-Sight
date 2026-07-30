import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { userDepartments, userRoles, users } from '@/db/schema.js'

export async function userExists(app: FastifyInstance, userId: number): Promise<boolean> {
  const [row] = await app.db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
    .limit(1)
  return Boolean(row)
}

export async function assignedRoleIds(app: FastifyInstance, userId: number): Promise<number[]> {
  const rows = await app.db
    .select({ id: userRoles.roleId })
    .from(userRoles)
    .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))
  return rows.map((row) => row.id)
}

export async function assignedDepartmentIds(
  app: FastifyInstance,
  userId: number,
): Promise<number[]> {
  const rows = await app.db
    .select({ id: userDepartments.departmentId })
    .from(userDepartments)
    .where(and(eq(userDepartments.userId, userId), eq(userDepartments.isDeleted, false)))
  return rows.map((row) => row.id)
}

export async function hasActiveDepartmentMembership(
  app: FastifyInstance,
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
