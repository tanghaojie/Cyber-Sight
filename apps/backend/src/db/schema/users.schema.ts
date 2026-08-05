import { sql } from 'drizzle-orm'
import {
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core'
import { auditColumns } from './common.schema.js'
import { departments } from './departments.schema.js'
import { roles } from './roles.schema.js'

export const users = pgTable(
  'sys_users',
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
    activeUsername: uniqueIndex('sys_users_username_active_unique')
      .on(table.username)
      .where(sql`${table.isDeleted} = false`),
    activeEmail: uniqueIndex('sys_users_email_active_unique')
      .on(table.email)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const userRoles = pgTable(
  'sys_user_roles',
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
    activeAssignment: uniqueIndex('sys_user_roles_user_role_active_unique')
      .on(table.userId, table.roleId)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const userDepartments = pgTable(
  'sys_user_departments',
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
    activeAssignment: uniqueIndex('sys_user_departments_user_department_active_unique')
      .on(table.userId, table.departmentId)
      .where(sql`${table.isDeleted} = false`),
    activePrimary: uniqueIndex('sys_user_departments_user_primary_active_unique')
      .on(table.userId)
      .where(sql`${table.isDeleted} = false AND ${table.isPrimary} = true`),
  }),
)

export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
