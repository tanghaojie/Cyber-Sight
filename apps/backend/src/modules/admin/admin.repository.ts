import {
  and,
  count,
  eq,
  ilike,
  inArray,
  or,
} from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { components } from '@scaffold/openapi-spec'
import {
  dictionaries,
  menus,
  roleMenus,
  roles,
  userRoles,
  users,
} from '../../db/schema.js'
import { hashPassword } from '../auth/auth.security.js'

type UserCreate = components['schemas']['UserCreateRequest']
type UserUpdate = components['schemas']['UserUpdateRequest']
type RoleRequest = components['schemas']['RoleRequest']
type MenuRequest = components['schemas']['MenuRequest']
type DictionaryRequest = components['schemas']['DictionaryRequest']

export interface ListQuery {
  pageNum: number
  pageSize: number
  keyword?: string
}

function auditView(row: {
  isDeleted: boolean
  createdAt: Date
  createdBy: number
  updatedAt: Date
  updatedBy: number
}) {
  return {
    isDeleted: row.isDeleted,
    createdAt: row.createdAt.toISOString(),
    createdBy: row.createdBy,
    updatedAt: row.updatedAt.toISOString(),
    updatedBy: row.updatedBy,
  }
}

function pageOffset(query: ListQuery): number {
  return (query.pageNum - 1) * query.pageSize
}

export async function listUsers(app: FastifyInstance, query: ListQuery) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(users.isDeleted, false),
    keyword
      ? or(
          ilike(users.username, `%${keyword}%`),
          ilike(users.displayName, `%${keyword}%`),
          ilike(users.email, `%${keyword}%`)
        )
      : undefined
  )
  const rows = await app.db
    .select()
    .from(users)
    .where(predicate)
    .orderBy(users.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db
    .select({ value: count() })
    .from(users)
    .where(predicate)

  const ids = rows.map((row) => row.id)
  const assignments = ids.length
    ? await app.db
        .select({ userId: userRoles.userId, roleId: userRoles.roleId })
        .from(userRoles)
        .where(
          and(
            inArray(userRoles.userId, ids),
            eq(userRoles.isDeleted, false)
          )
        )
    : []

  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      email: row.email,
      enabled: row.enabled,
      roleIds: assignments
        .filter((item) => item.userId === row.id)
        .map((item) => item.roleId),
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      ...auditView(row),
    })),
  }
}

async function replaceUserRoles(
  app: FastifyInstance,
  userId: number,
  roleIds: number[],
  actorId: number
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
  actorId: number
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
  actorId: number
): Promise<boolean> {
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined
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
  actorId: number
): Promise<boolean> {
  const result = await app.db
    .update(users)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(users.id, id), eq(users.isDeleted, false)))
    .returning({ id: users.id })
  return result.length > 0
}

export async function listRoles(app: FastifyInstance, query: ListQuery) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(roles.isDeleted, false),
    keyword
      ? or(
          ilike(roles.name, `%${keyword}%`),
          ilike(roles.code, `%${keyword}%`)
        )
      : undefined
  )
  const rows = await app.db
    .select()
    .from(roles)
    .where(predicate)
    .orderBy(roles.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db
    .select({ value: count() })
    .from(roles)
    .where(predicate)
  const ids = rows.map((row) => row.id)
  const assignments = ids.length
    ? await app.db
        .select({ roleId: roleMenus.roleId, menuId: roleMenus.menuId })
        .from(roleMenus)
        .where(
          and(inArray(roleMenus.roleId, ids), eq(roleMenus.isDeleted, false))
        )
    : []
  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      name: row.name,
      code: row.code,
      description: row.description,
      enabled: row.enabled,
      menuIds: assignments
        .filter((item) => item.roleId === row.id)
        .map((item) => item.menuId),
      ...auditView(row),
    })),
  }
}

async function replaceRoleMenus(
  app: FastifyInstance,
  roleId: number,
  menuIds: number[],
  actorId: number
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
      await app.db.insert(roleMenus).values({
        roleId,
        menuId,
        createdBy: actorId,
        updatedBy: actorId,
      })
    }
  }
}

export async function createRole(
  app: FastifyInstance,
  input: RoleRequest,
  actorId: number
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
  actorId: number
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
  actorId: number
): Promise<boolean> {
  const result = await app.db
    .update(roles)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(roles.id, id), eq(roles.isDeleted, false)))
    .returning({ id: roles.id })
  return result.length > 0
}

export async function listMenus(app: FastifyInstance, query: ListQuery) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(menus.isDeleted, false),
    keyword
      ? or(ilike(menus.name, `%${keyword}%`), ilike(menus.code, `%${keyword}%`))
      : undefined
  )
  const rows = await app.db
    .select()
    .from(menus)
    .where(predicate)
    .orderBy(menus.sortOrder, menus.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db
    .select({ value: count() })
    .from(menus)
    .where(predicate)
  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      parentId: row.parentId,
      name: row.name,
      code: row.code,
      path: row.path,
      icon: row.icon,
      sortOrder: row.sortOrder,
      type: row.type,
      enabled: row.enabled,
      ...auditView(row),
    })),
  }
}

export async function createMenu(
  app: FastifyInstance,
  input: MenuRequest,
  actorId: number
): Promise<number> {
  const [created] = await app.db
    .insert(menus)
    .values({ ...input, createdBy: actorId, updatedBy: actorId })
    .returning({ id: menus.id })
  return created.id
}

export async function updateMenu(
  app: FastifyInstance,
  id: number,
  input: MenuRequest,
  actorId: number
): Promise<boolean> {
  const result = await app.db
    .update(menus)
    .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(menus.id, id), eq(menus.isDeleted, false)))
    .returning({ id: menus.id })
  return result.length > 0
}

export async function softDeleteMenu(
  app: FastifyInstance,
  id: number,
  actorId: number
): Promise<boolean> {
  const result = await app.db
    .update(menus)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(menus.id, id), eq(menus.isDeleted, false)))
    .returning({ id: menus.id })
  return result.length > 0
}

export async function listDictionaries(
  app: FastifyInstance,
  query: ListQuery
) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(dictionaries.isDeleted, false),
    keyword
      ? or(
          ilike(dictionaries.type, `%${keyword}%`),
          ilike(dictionaries.label, `%${keyword}%`),
          ilike(dictionaries.value, `%${keyword}%`)
        )
      : undefined
  )
  const rows = await app.db
    .select()
    .from(dictionaries)
    .where(predicate)
    .orderBy(dictionaries.type, dictionaries.sortOrder, dictionaries.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db
    .select({ value: count() })
    .from(dictionaries)
    .where(predicate)
  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      type: row.type,
      label: row.label,
      value: row.value,
      sortOrder: row.sortOrder,
      enabled: row.enabled,
      remark: row.remark,
      ...auditView(row),
    })),
  }
}

export async function createDictionary(
  app: FastifyInstance,
  input: DictionaryRequest,
  actorId: number
): Promise<number> {
  const [created] = await app.db
    .insert(dictionaries)
    .values({ ...input, createdBy: actorId, updatedBy: actorId })
    .returning({ id: dictionaries.id })
  return created.id
}

export async function updateDictionary(
  app: FastifyInstance,
  id: number,
  input: DictionaryRequest,
  actorId: number
): Promise<boolean> {
  const result = await app.db
    .update(dictionaries)
    .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(dictionaries.id, id), eq(dictionaries.isDeleted, false)))
    .returning({ id: dictionaries.id })
  return result.length > 0
}

export async function softDeleteDictionary(
  app: FastifyInstance,
  id: number,
  actorId: number
): Promise<boolean> {
  const result = await app.db
    .update(dictionaries)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(dictionaries.id, id), eq(dictionaries.isDeleted, false)))
    .returning({ id: dictionaries.id })
  return result.length > 0
}
