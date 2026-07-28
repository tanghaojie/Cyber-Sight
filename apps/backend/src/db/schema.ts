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

export const menuType = pgEnum('menu_type', ['directory', 'menu', 'button'])

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

export const menus = pgTable(
  'menus',
  {
    id: serial('id').primaryKey(),
    parentId: integer('parent_id').default(0).notNull(),
    name: varchar('name', { length: 80 }).notNull(),
    code: varchar('code', { length: 80 }).notNull(),
    path: varchar('path', { length: 160 }).default('').notNull(),
    component: varchar('component', { length: 160 }).default('').notNull(),
    layout: varchar('layout', { length: 160 }).default('').notNull(),
    externalUrl: varchar('external_url', { length: 500 }).default('').notNull(),
    icon: varchar('icon', { length: 50 }).default('').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    type: menuType('type').default('menu').notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeCode: uniqueIndex('menus_code_active_unique')
      .on(table.code)
      .where(sql`${table.isDeleted} = false`),
  }),
)

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
