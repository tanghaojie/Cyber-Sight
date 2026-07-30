import { and, eq, inArray } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { roles } from '@/db/schema.js'

export async function roleExists(app: FastifyInstance, roleId: number): Promise<boolean> {
  const [row] = await app.db
    .select({ id: roles.id })
    .from(roles)
    .where(and(eq(roles.id, roleId), eq(roles.isDeleted, false)))
    .limit(1)
  return Boolean(row)
}

export async function enabledRoleIds(
  app: FastifyInstance,
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
