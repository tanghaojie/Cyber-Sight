import { sql } from 'drizzle-orm'
import { boolean, pgEnum, timestamp, uuid } from 'drizzle-orm/pg-core'

// 数据库枚举与共享契约保持同名同值，迁移负责把变化落到 PostgreSQL。
export const menuType = pgEnum('menu_type', ['directory', 'menu', 'button'])
export const authorizationSubjectType = pgEnum('authorization_subject_type', [
  'user',
  'role',
  'department',
])
// 数据范围只表达已登记的业务语义；授权模块会把它编译为中立访问计划，而不是存储 SQL。
export const dataScopeType = pgEnum('data_scope_type', [
  'self',
  'own_department',
  'own_department_tree',
  'custom_departments',
  'all',
])

/** PostgreSQL 18 原生生成时间有序 UUIDv7，所有应用表复用同一主键策略。 */
export function uuidv7PrimaryKey(name = 'id') {
  return uuid(name)
    .default(sql`uuidv7()`)
    .primaryKey()
}

/** 所有框架系统表复用软删除和五项生命周期审计字段。 */
export function auditColumns() {
  return {
    // 软删除保留历史记录；各仓储必须显式过滤，数据库不会自动隐藏这些行。
    isDeleted: boolean('is_deleted').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: uuid('created_by'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    updatedBy: uuid('updated_by'),
  }
}
