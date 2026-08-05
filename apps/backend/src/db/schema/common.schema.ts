import { boolean, integer, pgEnum, timestamp } from 'drizzle-orm/pg-core'

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

/** 所有框架系统表复用软删除和五项生命周期审计字段。 */
export function auditColumns() {
  return {
    isDeleted: boolean('is_deleted').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    createdBy: integer('created_by').default(0).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
    updatedBy: integer('updated_by').default(0).notNull(),
  }
}
