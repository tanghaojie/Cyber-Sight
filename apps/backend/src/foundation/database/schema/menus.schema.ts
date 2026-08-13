import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { auditColumns, menuType, uuidv7PrimaryKey } from './common.schema.js'
import { permissions } from './authorization.schema.js'
import { roles } from './roles.schema.js'

// 菜单保存导航元数据，权限授予仍由 authorization 模块的 rolePermissions 决定。
export const menus = pgTable('sys_menus', {
  id: uuidv7PrimaryKey(),
  parentId: uuid('parent_id'),
  name: varchar('name', { length: 80 }).notNull(),
  path: varchar('path', { length: 160 }).default('').notNull(),
  component: varchar('component', { length: 160 }).default('').notNull(),
  layout: varchar('layout', { length: 160 }).default('').notNull(),
  externalUrl: varchar('external_url', { length: 500 }).default('').notNull(),
  icon: varchar('icon', { length: 50 }).default('').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  type: menuType('type').default('menu').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  // 未绑定权限键表示所有已认证用户可见；绑定后只用于导航过滤，不能替代路由鉴权。
  requiredPermissionKey: varchar('required_permission_key', { length: 100 }).references(
    () => permissions.key,
  ),
  ...auditColumns(),
})

// roleMenus 为后续按角色直接分配菜单保留；当前导航主要由菜单权限键过滤。
export const roleMenus = pgTable(
  'sys_role_menus',
  {
    id: uuidv7PrimaryKey(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    menuId: uuid('menu_id')
      .notNull()
      .references(() => menus.id),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('sys_role_menus_role_menu_active_unique')
      .on(table.roleId, table.menuId)
      .where(sql`${table.isDeleted} = false`),
  }),
)
