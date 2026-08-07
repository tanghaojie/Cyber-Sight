import { and, count, eq, ilike } from 'drizzle-orm'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import type { CurrentUser, MenuRequest, NavigationMenu } from '@scaffold/api-contract'
import { menus } from '@/db/schema.js'
import { auditView, pageOffset, type RepositoryListQuery } from '@/shared/database/pagination.js'

// 导航构建阶段使用扁平且已脱敏的行；权限键和审计字段不应进入当前用户的导航响应。
type NavigationRow = Omit<NavigationMenu, 'children'>

function navigationRow(row: typeof menus.$inferSelect): NavigationRow {
  // 菜单管理摘要与导航响应复用基础字段，但导航不泄露 enabled、审计或权限配置细节。
  return {
    id: row.id,
    parentId: row.parentId,
    name: row.name,
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
    requiredPermissionKey: row.requiredPermissionKey,
    ...auditView(row),
  }
}

function orderedRows(rows: NavigationRow[]): NavigationRow[] {
  // sortOrder 相同时按 ID 兜底，保证数据库返回顺序变化不会造成导航抖动。
  return [...rows].sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id)
}

function hasParentCycle(row: NavigationRow, rowsById: Map<number, NavigationRow>): boolean {
  // 对遗留或异常数据做防御性检测，构建导航时不让循环父链造成递归死循环。
  const visited = new Set([row.id])
  let parentId = row.parentId
  while (parentId > 0) {
    if (visited.has(parentId)) {
      return true
    }
    visited.add(parentId)
    parentId = rowsById.get(parentId)?.parentId ?? 0
  }
  return false
}

function isUsableNavigationRow(row: NavigationRow): boolean {
  if (row.type === 'directory') {
    return true
  }
  if (row.type === 'menu') {
    return row.path.trim().length > 0 && row.component.trim().length > 0
  }
  return /^https?:\/\//i.test(row.externalUrl)
}

export function buildNavigationTree(
  rows: NavigationRow[],
  allowedMenuIds?: ReadonlySet<number>,
): NavigationMenu[] {
  // 该函数容忍历史脏数据：异常节点降级为根，不影响其他用户可访问菜单的渲染。
  // 先丢弃无法导航的残缺节点，再基于权限决定初始可见集合。
  const usableRows = rows.filter(isUsableNavigationRow)
  const allRowsById = new Map(usableRows.map((row) => [row.id, row]))
  const visibleIds = allowedMenuIds
    ? new Set(allowedMenuIds)
    : new Set(usableRows.map((row) => row.id))

  if (allowedMenuIds) {
    // 子菜单可见时补齐全部祖先目录，否则前端无法从根节点进入该菜单。
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

  const visibleRows = orderedRows(usableRows.filter((row) => visibleIds.has(row.id)))
  const visibleRowsById = new Map(visibleRows.map((row) => [row.id, row]))
  const nodesById = new Map<number, NavigationMenu>(
    visibleRows.map((row) => [row.id, { ...row, children: [] }]),
  )
  const roots: NavigationMenu[] = []

  for (const row of visibleRows) {
    const node = nodesById.get(row.id)!
    const parent = nodesById.get(row.parentId)
    if (parent && parent.type === 'directory' && !hasParentCycle(row, visibleRowsById)) {
      parent.children.push(node)
    } else {
      // 缺失父级、父级非目录或存在环的节点降级为根节点，保证其余导航仍可使用。
      roots.push(node)
    }
  }
  return roots
}

export async function listMenus(app: BackendRuntime, query: RepositoryListQuery) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(menus.isDeleted, false),
    keyword ? ilike(menus.name, `%${keyword}%`) : undefined,
  )
  const rows = await app.db
    .select()
    .from(menus)
    .where(predicate)
    .orderBy(menus.sortOrder, menus.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db.select({ value: count() }).from(menus).where(predicate)
  return {
    total,
    list: rows.map(menuSummary),
  }
}

export async function listAllMenus(app: BackendRuntime) {
  const rows = await app.db
    .select()
    .from(menus)
    .where(eq(menus.isDeleted, false))
    .orderBy(menus.sortOrder, menus.id)
  return rows.map(menuSummary)
}

export async function listNavigationMenus(
  app: BackendRuntime,
  user: CurrentUser,
): Promise<NavigationMenu[]> {
  const rows = await app.db
    .select()
    .from(menus)
    .where(and(eq(menus.enabled, true), eq(menus.isDeleted, false)))
    .orderBy(menus.sortOrder, menus.id)
  const permissionKeys = new Set(await app.authorization.effectivePermissionKeys(app, user))
  // 未绑定权限键的菜单对所有已认证用户可见，绑定后必须命中有效权限。
  const allowedMenuIds = new Set(
    rows
      .filter(
        (row) =>
          row.requiredPermissionKey === null || permissionKeys.has(row.requiredPermissionKey),
      )
      .map((row) => row.id),
  )
  return buildNavigationTree(rows.map(navigationRow), allowedMenuIds)
}

export async function validateMenuParent(
  app: BackendRuntime,
  parentId: number,
  currentId?: number,
): Promise<boolean> {
  if (parentId === 0) {
    return true
  }
  if (parentId === currentId) {
    return false
  }

  const rows = await app.db
    .select({ id: menus.id, parentId: menus.parentId, type: menus.type })
    .from(menus)
    .where(eq(menus.isDeleted, false))
  const byId = new Map(rows.map((row) => [row.id, row]))
  const parent = byId.get(parentId)
  // 只有目录可以承载子节点，页面和外链按钮必须是叶子。
  if (!parent || parent.type !== 'directory') {
    return false
  }

  const visited = new Set<number>()
  let cursor = parent
  // 从候选父级向上追溯，拒绝把当前节点或其后代放到自身下面。
  while (cursor.parentId > 0 && !visited.has(cursor.id)) {
    if (cursor.parentId === currentId) {
      return false
    }
    visited.add(cursor.id)
    const next = byId.get(cursor.parentId)
    if (!next) {
      break
    }
    cursor = next
  }
  return !visited.has(cursor.id)
}

export async function createMenu(
  app: BackendRuntime,
  input: MenuRequest,
  actorId: number,
): Promise<number> {
  const [created] = await app.db
    .insert(menus)
    .values({ ...input, createdBy: actorId, updatedBy: actorId })
    .returning({ id: menus.id })
  return created.id
}

export async function updateMenu(
  app: BackendRuntime,
  id: number,
  input: MenuRequest,
  actorId: number,
): Promise<boolean> {
  const result = await app.db
    .update(menus)
    .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(menus.id, id), eq(menus.isDeleted, false)))
    .returning({ id: menus.id })
  return result.length > 0
}

export async function hasActiveMenuChildren(app: BackendRuntime, id: number): Promise<boolean> {
  const [child] = await app.db
    .select({ id: menus.id })
    .from(menus)
    .where(and(eq(menus.parentId, id), eq(menus.isDeleted, false)))
    .limit(1)
  return Boolean(child)
}

export async function softDeleteMenu(
  app: BackendRuntime,
  id: number,
  actorId: number,
): Promise<boolean> {
  const result = await app.db
    .update(menus)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(menus.id, id), eq(menus.isDeleted, false)))
    .returning({ id: menus.id })
  return result.length > 0
}
