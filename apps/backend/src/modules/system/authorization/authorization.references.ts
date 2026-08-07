import { and, eq } from 'drizzle-orm'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import { dataPolicyDepartments, permissions } from '@/db/schema.js'

// 面向其他模块公开最小引用查询，避免菜单或部门模块穿透授权内部表结构。
export async function activePermissionKeyExists(
  app: BackendRuntime,
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
  app: BackendRuntime,
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
