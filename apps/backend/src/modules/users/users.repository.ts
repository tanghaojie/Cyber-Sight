import { and, count, eq, ilike, inArray, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { UserCreate, UserUpdate } from '@scaffold/api-contract'
import { userRoles, users } from '@/db/schema.js'
import { auditView, pageOffset, type RepositoryListQuery } from '@/shared/database/pagination.js'
import { hashPassword } from '@/modules/auth/auth.security.js'

export async function listUsers(app: FastifyInstance, query: RepositoryListQuery) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(users.isDeleted, false),
    keyword
      ? or(
          ilike(users.username, `%${keyword}%`),
          ilike(users.displayName, `%${keyword}%`),
          ilike(users.email, `%${keyword}%`),
        )
      : undefined,
  )
  const rows = await app.db
    .select()
    .from(users)
    .where(predicate)
    .orderBy(users.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db.select({ value: count() }).from(users).where(predicate)

  const ids = rows.map((row) => row.id)
  const assignments = ids.length
    ? await app.db
        .select({ userId: userRoles.userId, roleId: userRoles.roleId })
        .from(userRoles)
        .where(and(inArray(userRoles.userId, ids), eq(userRoles.isDeleted, false)))
    : []

  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      email: row.email,
      enabled: row.enabled,
      roleIds: assignments.filter((item) => item.userId === row.id).map((item) => item.roleId),
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      ...auditView(row),
    })),
  }
}

async function replaceUserRoles(
  app: FastifyInstance,
  userId: number,
  roleIds: number[],
  actorId: number,
): Promise<void> {
  const now = new Date()
  await app.db
    .update(userRoles)
    .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
    .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))

  for (const roleId of roleIds) {
    const [existing] = await app.db
      .select({ id: userRoles.id })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .limit(1)
    if (existing) {
      await app.db
        .update(userRoles)
        .set({ isDeleted: false, updatedAt: now, updatedBy: actorId })
        .where(eq(userRoles.id, existing.id))
    } else {
      await app.db.insert(userRoles).values({
        userId,
        roleId,
        createdBy: actorId,
        updatedBy: actorId,
      })
    }
  }
}

export async function createUser(
  app: FastifyInstance,
  input: UserCreate,
  actorId: number,
): Promise<number> {
  const [created] = await app.db
    .insert(users)
    .values({
      username: input.username,
      displayName: input.displayName,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      enabled: input.enabled,
      createdBy: actorId,
      updatedBy: actorId,
    })
    .returning({ id: users.id })
  await replaceUserRoles(app, created.id, input.roleIds, actorId)
  return created.id
}

export async function updateUser(
  app: FastifyInstance,
  id: number,
  input: UserUpdate,
  actorId: number,
): Promise<boolean> {
  const passwordHash = input.password ? await hashPassword(input.password) : undefined
  const updated = await app.db
    .update(users)
    .set({
      displayName: input.displayName,
      email: input.email,
      enabled: input.enabled,
      ...(passwordHash ? { passwordHash } : {}),
      updatedAt: new Date(),
      updatedBy: actorId,
    })
    .where(and(eq(users.id, id), eq(users.isDeleted, false)))
    .returning({ id: users.id })
  if (!updated.length) {
    return false
  }
  await replaceUserRoles(app, id, input.roleIds, actorId)
  return true
}

export async function softDeleteUser(
  app: FastifyInstance,
  id: number,
  actorId: number,
): Promise<boolean> {
  const result = await app.db
    .update(users)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(users.id, id), eq(users.isDeleted, false)))
    .returning({ id: users.id })
  return result.length > 0
}
