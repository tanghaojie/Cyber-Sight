import { getTableColumns } from 'drizzle-orm'
import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'
import {
  authSessions,
  dataPolicyDepartments,
  dataPolicyRules,
  departmentClosure,
  departments,
  dictionaries,
  menus,
  permissions,
  roleMenus,
  rolePermissions,
  roles,
  userDepartments,
  userRoles,
  users,
} from '@/db/schema.js'

// 集中枚举框架系统表，确保新增表不会遗漏物理前缀、软删除与审计字段。
const systemTables: Array<{ table: PgTable; name: string }> = [
  { table: users, name: 'sys_users' },
  { table: roles, name: 'sys_roles' },
  { table: userRoles, name: 'sys_user_roles' },
  { table: departments, name: 'sys_departments' },
  { table: departmentClosure, name: 'sys_department_closure' },
  { table: userDepartments, name: 'sys_user_departments' },
  { table: permissions, name: 'sys_permissions' },
  { table: rolePermissions, name: 'sys_role_permissions' },
  { table: menus, name: 'sys_menus' },
  { table: roleMenus, name: 'sys_role_menus' },
  { table: dictionaries, name: 'sys_dictionaries' },
  { table: dataPolicyRules, name: 'sys_data_policy_rules' },
  { table: dataPolicyDepartments, name: 'sys_data_policy_departments' },
  { table: authSessions, name: 'sys_auth_sessions' },
]

// 业务身份唯一性只约束有效记录，软删除后允许重新使用同一业务键。
const activeBusinessIdentityIndexes: Array<{
  table: PgTable
  name: string
  columns: string[]
}> = [
  { table: users, name: 'sys_users_username_active_unique', columns: ['username'] },
  { table: users, name: 'sys_users_email_active_unique', columns: ['email'] },
  {
    table: userRoles,
    name: 'sys_user_roles_user_role_active_unique',
    columns: ['user_id', 'role_id'],
  },
  {
    table: departmentClosure,
    name: 'sys_department_closure_path_active_unique',
    columns: ['ancestor_id', 'descendant_id'],
  },
  {
    table: userDepartments,
    name: 'sys_user_departments_user_department_active_unique',
    columns: ['user_id', 'department_id'],
  },
  {
    table: userDepartments,
    name: 'sys_user_departments_user_primary_active_unique',
    columns: ['user_id'],
  },
  {
    table: rolePermissions,
    name: 'sys_role_permissions_role_permission_active_unique',
    columns: ['role_id', 'permission_key'],
  },
  {
    table: dataPolicyRules,
    name: 'sys_data_policy_rules_identity_active_unique',
    columns: ['subject_type', 'subject_id', 'resource_key', 'action', 'scope_type'],
  },
  {
    table: dataPolicyDepartments,
    name: 'sys_data_policy_departments_rule_department_active_unique',
    columns: ['rule_id', 'department_id'],
  },
  {
    table: roleMenus,
    name: 'sys_role_menus_role_menu_active_unique',
    columns: ['role_id', 'menu_id'],
  },
  {
    table: dictionaries,
    name: 'sys_dictionaries_type_value_active_unique',
    columns: ['type', 'value'],
  },
]

describe('system table naming and lifecycle fields', () => {
  it.each(systemTables)('$name uses the system prefix', ({ table, name }) => {
    expect(getTableConfig(table).name).toBe(name)
    expect(name).toMatch(/^sys_/)
  })

  it.each(systemTables)('$name adds soft-delete and audit fields', ({ table }) => {
    const columns = getTableColumns(table)

    expect(columns).toHaveProperty('isDeleted')
    expect(columns).toHaveProperty('createdAt')
    expect(columns).toHaveProperty('createdBy')
    expect(columns).toHaveProperty('updatedAt')
    expect(columns).toHaveProperty('updatedBy')
  })
})

describe('menu routing fields', () => {
  it('stores controlled view and layout identifiers separately from external URLs', () => {
    const columns = getTableColumns(menus)
    expect(columns).toHaveProperty('component')
    expect(columns).toHaveProperty('layout')
    expect(columns).toHaveProperty('externalUrl')
    expect(columns).toHaveProperty('requiredPermissionKey')
    expect(columns).not.toHaveProperty('code')
  })
})

describe('role model fields', () => {
  it('uses an internal ID and user-facing name without a role code', () => {
    const columns = getTableColumns(roles)

    expect(columns).toHaveProperty('id')
    expect(columns).toHaveProperty('name')
    expect(columns).not.toHaveProperty('code')
  })
})

describe('department model fields', () => {
  it('uses an internal ID and user-facing name without a department code', () => {
    const columns = getTableColumns(departments)

    expect(columns).toHaveProperty('id')
    expect(columns).toHaveProperty('name')
    expect(columns).not.toHaveProperty('code')
  })
})

describe('soft-delete uniqueness', () => {
  it.each(activeBusinessIdentityIndexes)(
    '$name only requires unique business identities for active rows',
    ({ table, name, columns }) => {
      const tableConfig = getTableConfig(table)
      const activeIndex = tableConfig.indexes.find((index) => index.config.name === name)

      expect(activeIndex?.config.unique).toBe(true)
      expect(
        activeIndex?.config.columns.map((column) => ('name' in column ? column.name : undefined)),
      ).toEqual(columns)
      expect(activeIndex?.config.where).toBeDefined()
      expect(tableConfig.uniqueConstraints).toHaveLength(0)
    },
  )

  it('keeps persisted session token hashes globally unique', () => {
    expect(authSessions.tokenHash.isUnique).toBe(true)
    expect(authSessions.tokenHash.uniqueName).toBe('sys_auth_sessions_token_hash_unique')
  })
})
