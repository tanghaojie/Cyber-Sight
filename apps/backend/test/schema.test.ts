import { getTableColumns } from 'drizzle-orm'
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
