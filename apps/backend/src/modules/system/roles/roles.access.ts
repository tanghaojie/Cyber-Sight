import { and, eq, inArray } from 'drizzle-orm'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import { roles } from '@/db/schema.js'

// 供用户分配和授权决策复用的最小角色查询，不公开角色管理仓储。
export async function roleExists(app: BackendRuntime, roleId: number): Promise<boolean> {
  const [row] = await app.db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.id, roleId), eq(roles.isDeleted, false)))
    .limit(1)
  return Boolean(row)
}

export async function enabledRoleIds(
  app: BackendRuntime,
  candidateIds: number[],
): Promise<number[]> {
  if (candidateIds.length === 0) {
    return []
  }
  const rows = await app.db
    .select({ id: roles.id })
    .from(roles)
    .where(
      and(inArray(roles.id, candidateIds), eq(roles.enabled, true), eq(roles.isDeleted, false)),
    )
  return rows.map((row) => row.id)
}
