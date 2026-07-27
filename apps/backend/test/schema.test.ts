import { getTableColumns } from 'drizzle-orm'
import { getTableConfig } from 'drizzle-orm/pg-core'
import { describe, expect, it } from 'vitest'
import {
  authSessions,
  dictionaries,
  menus,
  roleMenus,
  roles,
  userRoles,
  users,
} from '../src/db/schema.js'

const tables = [
  users,
  roles,
  userRoles,
  menus,
  roleMenus,
  dictionaries,
  authSessions,
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
  it('stores controlled view identifiers and external URLs separately', () => {
    const columns = getTableColumns(menus)
    expect(columns).toHaveProperty('component')
    expect(columns).toHaveProperty('externalUrl')
  })
})

describe('menu code uniqueness', () => {
  it('only requires unique codes for active menus', () => {
    const activeCodeIndex = getTableConfig(menus).indexes.find(
      (index) => index.config.name === 'menus_code_active_unique'
    )

    expect(activeCodeIndex?.config.unique).toBe(true)
    expect(
      activeCodeIndex?.config.columns.map((column) => (
        'name' in column ? column.name : undefined
      ))
    ).toEqual(['code'])
    expect(activeCodeIndex?.config.where).toBeDefined()
    expect(getTableConfig(menus).uniqueConstraints).toHaveLength(0)
  })
})
