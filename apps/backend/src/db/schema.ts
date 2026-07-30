import { sql } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'

// 数据库枚举与共享契约保持同名同值，迁移负责把变化落到 PostgreSQL。
export const menuType = pgEnum('menu_type', ['directory', 'menu', 'button'])
export const authorizationSubjectType = pgEnum('authorization_subject_type', [
  'user',
  'role',
  'department',
])
export const dataScopeType = pgEnum('data_scope_type', [
  'self',
  'own_department',
  'own_department_tree',
  'custom_departments',
  'all',
])

/** 所有业务表复用软删除和五项生命周期审计字段。 */
export function auditColumns() {
  return {
    isDeleted: boolean('is_deleted').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: integer('created_by').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    updatedBy: integer('updated_by').default(0).notNull(),
  }
}

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', { length: 50 }).notNull(),
    displayName: varchar('display_name', { length: 80 }).notNull(),
    email: varchar('email', { length: 160 }).notNull(),
    passwordHash: text('password_hash').notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
    ...auditColumns(),
  },
  (table) => ({
    // 部分唯一索引允许软删除后复用用户名和邮箱，同时保护全部有效记录。
    activeUsername: uniqueIndex('users_username_active_unique')
      .on(table.username)
      .where(sql`${table.isDeleted} = false`),
    activeEmail: uniqueIndex('users_email_active_unique')
      .on(table.email)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const roles = pgTable(
  'roles',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 80 }).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    description: varchar('description', { length: 200 }).default('').notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeCode: uniqueIndex('roles_code_active_unique')
      .on(table.code)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const userRoles = pgTable(
  'user_roles',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('user_roles_user_role_active_unique')
      .on(table.userId, table.roleId)
      .where(sql`${table.isDeleted} = false`),
  }),
)

// 部门邻接表保存直接父子关系，闭包表保存全部祖先路径以加速树范围查询。
export const departments = pgTable(
  'departments',
  {
    id: serial('id').primaryKey(),
    parentId: integer('parent_id').default(0).notNull(),
    code: varchar('code', { length: 50 }).notNull(),
    name: varchar('name', { length: 80 }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeCode: uniqueIndex('departments_code_active_unique')
      .on(table.code)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const departmentClosure = pgTable(
  'department_closure',
  {
    id: serial('id').primaryKey(),
    ancestorId: integer('ancestor_id')
      .notNull()
      .references(() => departments.id),
    descendantId: integer('descendant_id')
      .notNull()
      .references(() => departments.id),
    depth: integer('depth').notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activePath: uniqueIndex('department_closure_path_active_unique')
      .on(table.ancestorId, table.descendantId)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const userDepartments = pgTable(
  'user_departments',
  {
    id: serial('id').primaryKey(),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id),
    departmentId: integer('department_id')
      .notNull()
      .references(() => departments.id),
    isPrimary: boolean('is_primary').default(false).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('user_departments_user_department_active_unique')
      .on(table.userId, table.departmentId)
      .where(sql`${table.isDeleted} = false`),
    activePrimary: uniqueIndex('user_departments_user_primary_active_unique')
      .on(table.userId)
      .where(sql`${table.isDeleted} = false AND ${table.isPrimary} = true`),
  }),
)

// 功能权限归授权模块所有，角色通过稳定 permissionKey 建立多对多关系。
export const permissions = pgTable('permissions', {
  id: serial('id').primaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  module: varchar('module', { length: 80 }).notNull(),
  name: varchar('name', { length: 80 }).notNull(),
  description: varchar('description', { length: 200 }).default('').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  ...auditColumns(),
})

export const rolePermissions = pgTable(
  'role_permissions',
  {
    id: serial('id').primaryKey(),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id),
    permissionKey: varchar('permission_key', { length: 100 })
      .notNull()
      .references(() => permissions.key),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('role_permissions_role_permission_active_unique')
      .on(table.roleId, table.permissionKey)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const menus = pgTable('menus', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id').default(0).notNull(),
  name: varchar('name', { length: 80 }).notNull(),
  path: varchar('path', { length: 160 }).default('').notNull(),
  component: varchar('component', { length: 160 }).default('').notNull(),
  layout: varchar('layout', { length: 160 }).default('').notNull(),
  externalUrl: varchar('external_url', { length: 500 }).default('').notNull(),
  icon: varchar('icon', { length: 50 }).default('').notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  type: menuType('type').default('menu').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  requiredPermissionKey: varchar('required_permission_key', { length: 100 }).references(
    () => permissions.key,
  ),
  ...auditColumns(),
})

// roleMenus 为后续按角色直接分配菜单保留；当前导航主要由菜单权限键过滤。
export const roleMenus = pgTable(
  'role_menus',
  {
    id: serial('id').primaryKey(),
    roleId: integer('role_id')
      .notNull()
      .references(() => roles.id),
    menuId: integer('menu_id')
      .notNull()
      .references(() => menus.id),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('role_menus_role_menu_active_unique')
      .on(table.roleId, table.menuId)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const dictionaries = pgTable(
  'dictionaries',
  {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 80 }).notNull(),
    label: varchar('label', { length: 80 }).notNull(),
    value: varchar('value', { length: 120 }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    remark: varchar('remark', { length: 200 }).default('').notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeEntry: uniqueIndex('dictionaries_type_value_active_unique')
      .on(table.type, table.value)
      .where(sql`${table.isDeleted} = false`),
  }),
)

// 数据策略主表描述作用主体和范围类型，部门明细表只服务于 custom_departments。
export const dataPolicyRules = pgTable(
  'data_policy_rules',
  {
    id: serial('id').primaryKey(),
    subjectType: authorizationSubjectType('subject_type').notNull(),
    subjectId: integer('subject_id').notNull(),
    resourceKey: varchar('resource_key', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    scopeType: dataScopeType('scope_type').notNull(),
    inheritToChildren: boolean('inherit_to_children').default(false).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeRule: uniqueIndex('data_policy_rules_identity_active_unique')
      .on(table.subjectType, table.subjectId, table.resourceKey, table.action, table.scopeType)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const dataPolicyDepartments = pgTable(
  'data_policy_departments',
  {
    id: serial('id').primaryKey(),
    ruleId: integer('rule_id')
      .notNull()
      .references(() => dataPolicyRules.id),
    departmentId: integer('department_id')
      .notNull()
      .references(() => departments.id),
    includeDescendants: boolean('include_descendants').default(false).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('data_policy_departments_rule_department_active_unique')
      .on(table.ruleId, table.departmentId)
      .where(sql`${table.isDeleted} = false`),
  }),
)

// 会话表只保存令牌摘要；JWT 原文仅返回调用方并短期驻留内存缓存。
export const authSessions = pgTable('auth_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ...auditColumns(),
})

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
