import { sql } from 'drizzle-orm'
import { boolean, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import {
  auditColumns,
  authorizationSubjectType,
  dataScopeType,
  uuidv7PrimaryKey,
} from './common.schema.js'
import { departments } from './departments.schema.js'
import { roles } from './roles.schema.js'

// 功能权限归授权模块所有，角色通过稳定 permissionKey 建立多对多关系。
export const permissions = pgTable('sys_permissions', {
  id: uuidv7PrimaryKey(),
  key: varchar('key', { length: 100 }).notNull().unique(),
  module: varchar('module', { length: 80 }).notNull(),
  name: varchar('name', { length: 80 }).notNull(),
  description: varchar('description', { length: 200 }).default('').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  ...auditColumns(),
})

// 软删除后允许恢复同一角色—权限关系；部分唯一索引只禁止两个同时有效的重复授权。
export const rolePermissions = pgTable(
  'sys_role_permissions',
  {
    id: uuidv7PrimaryKey(),
    roleId: uuid('role_id')
      .notNull()
      .references(() => roles.id),
    permissionKey: varchar('permission_key', { length: 100 })
      .notNull()
      .references(() => permissions.key),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('sys_role_permissions_role_permission_active_unique')
      .on(table.roleId, table.permissionKey)
      .where(sql`${table.isDeleted} = false`),
  }),
)

// 数据策略主表描述作用主体和范围类型，部门明细表只服务于 custom_departments。
export const dataPolicyRules = pgTable(
  'sys_data_policy_rules',
  {
    id: uuidv7PrimaryKey(),
    subjectType: authorizationSubjectType('subject_type').notNull(),
    subjectId: uuid('subject_id').notNull(),
    resourceKey: varchar('resource_key', { length: 100 }).notNull(),
    action: varchar('action', { length: 50 }).notNull(),
    scopeType: dataScopeType('scope_type').notNull(),
    inheritToChildren: boolean('inherit_to_children').default(false).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeRule: uniqueIndex('sys_data_policy_rules_identity_active_unique')
      .on(table.subjectType, table.subjectId, table.resourceKey, table.action, table.scopeType)
      .where(sql`${table.isDeleted} = false`),
  }),
)

// 仅 custom_departments 规则会有这些明细；includeDescendants 描述目标范围，不等同于主体策略继承。
export const dataPolicyDepartments = pgTable(
  'sys_data_policy_departments',
  {
    id: uuidv7PrimaryKey(),
    ruleId: uuid('rule_id')
      .notNull()
      .references(() => dataPolicyRules.id),
    departmentId: uuid('department_id')
      .notNull()
      .references(() => departments.id),
    includeDescendants: boolean('include_descendants').default(false).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('sys_data_policy_departments_rule_department_active_unique')
      .on(table.ruleId, table.departmentId)
      .where(sql`${table.isDeleted} = false`),
  }),
)
