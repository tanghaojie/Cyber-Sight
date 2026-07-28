import { and, count, eq, ilike, inArray, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type {
  CurrentUser,
  MenuRequest,
  NavigationMenu,
} from '@scaffold/api-contract'
import { menus, roleMenus, roles, userRoles } from '../../db/schema.js'
import {
  auditView,
  pageOffset,
  type RepositoryListQuery,
} from '../../shared/database/pagination.js'

type NavigationRow = Omit<NavigationMenu, 'children'>

function navigationRow(row: typeof menus.$inferSelect): NavigationRow {
  return {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
    code: row.code,
    path: row.path,
    component: row.component,
    layout: row.layout,
    externalUrl: row.externalUrl,
    icon: row.icon,
    sortOrder: row.sortOrder,
    type: row.type,
  }
}

function menuSummary(row: typeof menus.$inferSelect) {
  return {
    ...navigationRow(row),
    enabled: row.enabled,
    ...auditView(row),
  }
}

function orderedRows(rows: NavigationRow[]): NavigationRow[] {
  return [...rows].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.id - right.id
  )
}

function hasParentCycle(
  row: NavigationRow,
  rowsById: Map<number, NavigationRow>
): boolean {
  const visited = new Set([row.id])
  let parentId = row.parentId
  while (parentId > 0) {
    if (visited.has(parentId)) return true
    visited.add(parentId)
    parentId = rowsById.get(parentId)?.parentId ?? 0
  }
  return false
}

function isUsableNavigationRow(row: NavigationRow): boolean {
  if (row.type === 'directory') return true
  if (row.type === 'menu') {
    return row.path.startsWith('/') && row.component.trim().length > 0
  }
  return /^https?:\/\//i.test(row.externalUrl)
}

export function buildNavigationTree(
  rows: NavigationRow[],
  allowedMenuIds?: ReadonlySet<number>
): NavigationMenu[] {
  const usableRows = rows.filter(isUsableNavigationRow)
  const allRowsById = new Map(usableRows.map((row) => [row.id, row]))
  const visibleIds = allowedMenuIds
    ? new Set(allowedMenuIds)
    : new Set(usableRows.map((row) => row.id))

  if (allowedMenuIds) {
    for (const id of allowedMenuIds) {
      const visited = new Set<number>()
      let current = allRowsById.get(id)
      while (current && current.parentId > 0 && !visited.has(current.id)) {
        visited.add(current.id)
        visibleIds.add(current.parentId)
        current = allRowsById.get(current.parentId)
      }
    }
  }

  const visibleRows = orderedRows(
    usableRows.filter((row) => visibleIds.has(row.id))
  )
  const visibleRowsById = new Map(visibleRows.map((row) => [row.id, row]))
  const nodesById = new Map<number, NavigationMenu>(
    visibleRows.map((row) => [row.id, { ...row, children: [] }])
  )
  const roots: NavigationMenu[] = []

  for (const row of visibleRows) {
    const node = nodesById.get(row.id)!
    const parent = nodesById.get(row.parentId)
    if (parent && parent.type === 'directory' && !hasParentCycle(row, visibleRowsById)) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }
  return roots
}

export async function listMenus(
  app: FastifyInstance,
  query: RepositoryListQuery
) {
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
    list: rows.map(menuSummary),
  }
}

export async function listAllMenus(app: FastifyInstance) {
  const rows = await app.db
    .select()
    .from(menus)
    .where(eq(menus.isDeleted, false))
    .orderBy(menus.sortOrder, menus.id)
  return rows.map(menuSummary)
}

export async function listNavigationMenus(
  app: FastifyInstance,
  user: CurrentUser
): Promise<NavigationMenu[]> {
  const rows = await app.db
    .select()
    .from(menus)
    .where(and(eq(menus.enabled, true), eq(menus.isDeleted, false)))
    .orderBy(menus.sortOrder, menus.id)
  const navigationRows = rows.map(navigationRow)
  if (user.roles.includes('SUPER_ADMIN')) {
    return buildNavigationTree(navigationRows)
  }

  const assignments = await app.db
    .select({ menuId: roleMenus.menuId })
    .from(userRoles)
    .innerJoin(
      roles,
      and(
        eq(userRoles.roleId, roles.id),
        eq(roles.enabled, true),
        eq(roles.isDeleted, false)
      )
    )
    .innerJoin(
      roleMenus,
      and(eq(roleMenus.roleId, roles.id), eq(roleMenus.isDeleted, false))
    )
    .where(
      and(eq(userRoles.userId, user.id), eq(userRoles.isDeleted, false))
    )
  return buildNavigationTree(
    navigationRows,
    new Set(assignments.map((item) => item.menuId))
  )
}

export async function validateMenuParent(
  app: FastifyInstance,
  parentId: number,
  currentId?: number
): Promise<boolean> {
  if (parentId === 0) return true
  if (parentId === currentId) return false

  const rows = await app.db
    .select({ id: menus.id, parentId: menus.parentId, type: menus.type })
    .from(menus)
    .where(eq(menus.isDeleted, false))
  const byId = new Map(rows.map((row) => [row.id, row]))
  const parent = byId.get(parentId)
  if (!parent || parent.type !== 'directory') return false

  const visited = new Set<number>()
  let cursor = parent
  while (cursor.parentId > 0 && !visited.has(cursor.id)) {
    if (cursor.parentId === currentId) return false
    visited.add(cursor.id)
    const next = byId.get(cursor.parentId)
    if (!next) break
    cursor = next
  }
  return !visited.has(cursor.id)
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

export async function hasActiveMenuChildren(
  app: FastifyInstance,
  id: number
): Promise<boolean> {
  const [child] = await app.db
    .select({ id: menus.id })
    .from(menus)
    .where(and(eq(menus.parentId, id), eq(menus.isDeleted, false)))
    .limit(1)
  return Boolean(child)
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
