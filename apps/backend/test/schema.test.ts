import { getTableColumns } from 'drizzle-orm'
import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'
import {
  authSessions,
  dictionaries,
  menus,
  roleMenus,
  roles,
  userRoles,
  users,
} from '@/db/schema.js'

const tables = [users, roles, userRoles, menus, roleMenus, dictionaries, authSessions]

const activeBusinessIdentityIndexes: Array<{
  table: PgTable
  name: string
  columns: string[]
}> = [
  { table: users, name: 'users_username_active_unique', columns: ['username'] },
  { table: users, name: 'users_email_active_unique', columns: ['email'] },
  { table: roles, name: 'roles_code_active_unique', columns: ['code'] },
  {
    table: userRoles,
    name: 'user_roles_user_role_active_unique',
    columns: ['user_id', 'role_id'],
  },
  {
    table: roleMenus,
    name: 'role_menus_role_menu_active_unique',
    columns: ['role_id', 'menu_id'],
  },
  {
    table: dictionaries,
    name: 'dictionaries_type_value_active_unique',
    columns: ['type', 'value'],
  },
]

describe('database lifecycle fields', () => {
  it.each(tables)('adds soft-delete and audit fields to every table', (table) => {
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
    expect(authSessions.tokenHash.uniqueName).toBe('auth_sessions_token_hash_unique')
  })
})
