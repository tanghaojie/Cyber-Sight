import { and, eq } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { dataPolicyDepartments, permissions } from '@/db/schema.js'

export async function activePermissionKeyExists(
  app: FastifyInstance,
  permissionKey: string,
): Promise<boolean> {
  const [row] = await app.db
    .select({ key: permissions.key })
    .from(permissions)
    .where(
      and(
        eq(permissions.key, permissionKey),
        eq(permissions.enabled, true),
        eq(permissions.isDeleted, false),
      ),
    )
    .limit(1)
  return Boolean(row)
}

export async function hasActiveDepartmentPolicyReference(
  app: FastifyInstance,
  departmentId: number,
): Promise<boolean> {
  const [row] = await app.db
    .select({ id: dataPolicyDepartments.id })
    .from(dataPolicyDepartments)
    .where(
      and(
        eq(dataPolicyDepartments.departmentId, departmentId),
        eq(dataPolicyDepartments.isDeleted, false),
      ),
    )
    .limit(1)
  return Boolean(row)
}
