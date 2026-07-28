import { and, count, eq, ilike, inArray, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { RoleRequest } from '@scaffold/api-contract'
import { roleMenus, roles } from '@/db/schema.js'
import { auditView, pageOffset, type RepositoryListQuery } from '@/shared/database/pagination.js'

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
  const ids = rows.map((row) => row.id)
  const assignments = ids.length
    ? await app.db
        .select({ roleId: roleMenus.roleId, menuId: roleMenus.menuId })
        .from(roleMenus)
        .where(and(inArray(roleMenus.roleId, ids), eq(roleMenus.isDeleted, false)))
    : []
  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      enabled: row.enabled,
      menuIds: assignments.filter((item) => item.roleId === row.id).map((item) => item.menuId),
      ...auditView(row),
    })),
  }
}

async function replaceRoleMenus(
  app: FastifyInstance,
  roleId: number,
  menuIds: number[],
  actorId: number,
): Promise<void> {
  const now = new Date()
  await app.db
    .update(roleMenus)
    .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
    .where(and(eq(roleMenus.roleId, roleId), eq(roleMenus.isDeleted, false)))
  for (const menuId of menuIds) {
    const [existing] = await app.db
      .select({ id: roleMenus.id })
      .from(roleMenus)
      .where(and(eq(roleMenus.roleId, roleId), eq(roleMenus.menuId, menuId)))
      .limit(1)
    if (existing) {
      await app.db
        .update(roleMenus)
        .set({ isDeleted: false, updatedAt: now, updatedBy: actorId })
        .where(eq(roleMenus.id, existing.id))
    } else {
      await app.db
        .insert(roleMenus)
        .values({ roleId, menuId, createdBy: actorId, updatedBy: actorId })
    }
  }
}

export async function createRole(
  app: FastifyInstance,
  input: RoleRequest,
  actorId: number,
): Promise<number> {
  const { menuIds, ...values } = input
  const [created] = await app.db
    .insert(roles)
    .values({ ...values, createdBy: actorId, updatedBy: actorId })
    .returning({ id: roles.id })
  await replaceRoleMenus(app, created.id, menuIds, actorId)
  return created.id
}

export async function updateRole(
  app: FastifyInstance,
  id: number,
  input: RoleRequest,
  actorId: number,
): Promise<boolean> {
  const { menuIds, ...values } = input
  const updated = await app.db
    .update(roles)
    .set({ ...values, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(roles.id, id), eq(roles.isDeleted, false)))
    .returning({ id: roles.id })
  if (!updated.length) return false
  await replaceRoleMenus(app, id, menuIds, actorId)
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
