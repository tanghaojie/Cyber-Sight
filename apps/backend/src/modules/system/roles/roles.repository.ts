import { and, count, eq, ilike, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { RoleRequest } from '@scaffold/api-contract'
import { roles } from '@/db/schema.js'
import { auditView, pageOffset, type RepositoryListQuery } from '@/shared/database/pagination.js'

/** 角色仓储统一过滤软删除记录，并在写操作中维护操作者审计字段。 */
export async function listRoles(app: FastifyInstance, query: RepositoryListQuery) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(roles.isDeleted, false),
    keyword ? or(ilike(roles.name, `%${keyword}%`), ilike(roles.code, `%${keyword}%`)) : undefined,
  )
  const rows = await app.db
    .select()
    .from(roles)
    .where(predicate)
    .orderBy(roles.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db.select({ value: count() }).from(roles).where(predicate)
  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      enabled: row.enabled,
      ...auditView(row),
    })),
  }
}

export async function createRole(
  app: FastifyInstance,
  input: RoleRequest,
  actorId: number,
): Promise<number> {
  const [created] = await app.db
    .insert(roles)
    .values({ ...input, createdBy: actorId, updatedBy: actorId })
    .returning({ id: roles.id })
  return created.id
}

export async function updateRole(
  app: FastifyInstance,
  id: number,
  input: RoleRequest,
  actorId: number,
): Promise<boolean> {
  const updated = await app.db
    .update(roles)
    .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(roles.id, id), eq(roles.isDeleted, false)))
    .returning({ id: roles.id })
  if (!updated.length) {
    return false
  }
  return true
}

export async function softDeleteRole(
  app: FastifyInstance,
  id: number,
  actorId: number,
): Promise<boolean> {
  const result = await app.db
    .update(roles)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(roles.id, id), eq(roles.isDeleted, false)))
    .returning({ id: roles.id })
  return result.length > 0
}
