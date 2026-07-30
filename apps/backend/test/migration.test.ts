import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface MigrationJournal {
  entries: Array<{ tag: string }>
}

const legacyTableNames = [
  'auth_sessions',
  'data_policy_departments',
  'data_policy_rules',
  'department_closure',
  'departments',
  'dictionaries',
  'menus',
  'permissions',
  'role_menus',
  'role_permissions',
  'roles',
  'user_departments',
  'user_roles',
  'users',
]
const systemTableNames = legacyTableNames.map((name) => `sys_${name}`)

function migrationJournal(): MigrationJournal {
  const journalUrl = new URL('../drizzle/meta/_journal.json', import.meta.url)
  return JSON.parse(readFileSync(journalUrl, 'utf8')) as MigrationJournal
}

function migrationFiles(): string[] {
  return readdirSync(new URL('../drizzle/', import.meta.url))
    .filter((name) => name.endsWith('.sql'))
    .sort()
}

function snapshotFiles(): string[] {
  return readdirSync(new URL('../drizzle/meta/', import.meta.url))
    .filter((name) => name.endsWith('_snapshot.json'))
    .sort()
}

function baselineMigrationSql(): string {
  const [entry] = migrationJournal().entries
  if (!entry) {
    throw new Error('No baseline migration found')
  }
  return readFileSync(new URL(`../drizzle/${entry.tag}.sql`, import.meta.url), 'utf8')
}

describe('database migration baseline', () => {
  it('collapses SQL, snapshot and journal history into one initial migration', () => {
    const journal = migrationJournal()

    expect(journal.entries).toHaveLength(1)
    expect(journal.entries[0]?.tag).toBe('0000_initial_system_schema')
    expect(migrationFiles()).toEqual(['0000_initial_system_schema.sql'])
    expect(snapshotFiles()).toEqual(['0000_snapshot.json'])
  })

  it('creates every application table with the sys_ prefix', () => {
    const migrationSql = baselineMigrationSql()

    for (const tableName of systemTableNames) {
      expect(migrationSql).toContain(`CREATE TABLE IF NOT EXISTS "${tableName}"`)
    }
    for (const tableName of legacyTableNames) {
      expect(migrationSql).not.toContain(`"${tableName}"`)
    }
  })

  it('contains the final menu and soft-delete uniqueness model directly', () => {
    const migrationSql = baselineMigrationSql()

    expect(migrationSql).toContain('"layout" varchar(160) DEFAULT \'\' NOT NULL')
    expect(migrationSql).toContain('"required_permission_key" varchar(100)')
    expect(migrationSql).not.toContain('"code" varchar(80)')
    expect(migrationSql).toContain('"sys_auth_sessions_token_hash_unique"')
    expect(migrationSql.match(/CREATE UNIQUE INDEX IF NOT EXISTS "sys_/g)).toHaveLength(13)
    expect(migrationSql.match(/WHERE "sys_[^"]+"\."is_deleted" = false/g)).toHaveLength(13)
  })

  it('seeds the fresh database with framework administration data', () => {
    const migrationSql = baselineMigrationSql()

    for (const tableName of [
      'sys_roles',
      'sys_users',
      'sys_user_roles',
      'sys_permissions',
      'sys_departments',
      'sys_department_closure',
      'sys_user_departments',
      'sys_menus',
      'sys_role_menus',
      'sys_dictionaries',
      'sys_role_permissions',
      'sys_data_policy_rules',
    ]) {
      expect(migrationSql).toContain(`INSERT INTO "${tableName}"`)
    }
    expect(migrationSql).toContain("'SUPER_ADMIN'")
    expect(migrationSql).toContain("'admin'")
    expect(migrationSql).toContain("'departments.manage'")
    expect(migrationSql).toContain("('read'), ('create'), ('update'), ('delete')")
  })

  it('seeds only layout roots and relative management child paths', () => {
    const migrationSql = baselineMigrationSql()

    expect(migrationSql).toContain(
      "(0, '组织与权限', '/sys', '', 'AdminLayout', '', 'layers', 20, 'directory', true)",
    )
    expect(migrationSql).toContain(
      "(0, '系统配置', '/config', '', 'AdminLayout', '', 'settings', 30, 'directory', true)",
    )
    for (const [parentName, name, path, component] of [
      ['组织与权限', '用户管理', 'users', 'users'],
      ['组织与权限', '角色管理', 'roles', 'roles'],
      ['组织与权限', '部门管理', 'departments', 'departments'],
      ['组织与权限', '菜单管理', 'menus', 'menus'],
      ['系统配置', '字典管理', 'dictionaries', 'dictionaries'],
    ]) {
      expect(migrationSql).toContain(`('${parentName}', '${name}', '${path}', '${component}'`)
    }
    expect(migrationSql).not.toContain("'工作台'")
    expect(migrationSql).not.toContain("'首页'")
  })
})
