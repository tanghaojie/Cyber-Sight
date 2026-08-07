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
const positionTableNames = ['sys_positions', 'sys_user_positions']

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

function apiLogMigrationSql(): string {
  return readFileSync(new URL('../drizzle/0001_luxuriant_violations.sql', import.meta.url), 'utf8')
}

function apiLogNavigationMigrationSql(): string {
  return readFileSync(
    new URL('../drizzle/0002_api_log_operations_menu.sql', import.meta.url),
    'utf8',
  )
}

function aboutProjectMigrationSql(): string {
  return readFileSync(new URL('../drizzle/0003_about_project_menu.sql', import.meta.url), 'utf8')
}

function positionMigrationSql(): string {
  return readFileSync(new URL('../drizzle/0004_positions_management.sql', import.meta.url), 'utf8')
}

describe('database migration baseline', () => {
  it('keeps the initial baseline and appends later schema changes', () => {
    const journal = migrationJournal()

    expect(journal.entries).toHaveLength(4)
    expect(journal.entries[0]?.tag).toBe('0000_initial_system_schema')
    expect(journal.entries[1]?.tag).toBe('0001_luxuriant_violations')
    expect(journal.entries[2]?.tag).toBe('0002_api_log_operations_menu')
    expect(journal.entries[3]?.tag).toBe('0003_about_project_menu')
    expect(migrationFiles()).toEqual([
      '0000_initial_system_schema.sql',
      '0001_luxuriant_violations.sql',
      '0002_api_log_operations_menu.sql',
      '0003_about_project_menu.sql',
      '0004_positions_management.sql',
    ])
    expect(snapshotFiles()).toEqual(['0000_snapshot.json', '0001_snapshot.json'])
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

  it('appends the position tables and organization-management seed data', () => {
    const migrationSql = positionMigrationSql()

    for (const tableName of positionTableNames) {
      expect(migrationSql).toContain(`CREATE TABLE IF NOT EXISTS "${tableName}"`)
    }
    expect(migrationSql).toContain('"sys_positions_department_name_active_unique"')
    expect(migrationSql).toContain('"sys_user_positions_user_position_active_unique"')
    expect(migrationSql).toContain("'positions.manage'")
    expect(migrationSql).toContain("'岗位管理'")
    expect(migrationSql).not.toContain('岗位编码')
    expect(migrationSql).not.toContain('"code"')
  })

  it('contains the final menu and soft-delete uniqueness model directly', () => {
    const migrationSql = baselineMigrationSql()

    expect(migrationSql).toContain('"layout" varchar(160) DEFAULT \'\' NOT NULL')
    expect(migrationSql).toContain('"required_permission_key" varchar(100)')
    expect(migrationSql).not.toContain('"code" varchar(80)')
    expect(migrationSql).not.toContain('"sys_departments_code_active_unique"')
    expect(migrationSql).not.toContain('"sys_roles_code_active_unique"')
    expect(migrationSql).toContain('"sys_auth_sessions_token_hash_unique"')
    expect(migrationSql.match(/CREATE UNIQUE INDEX IF NOT EXISTS "sys_/g)).toHaveLength(11)
    expect(migrationSql.match(/WHERE "sys_[^"]+"\."is_deleted" = false/g)).toHaveLength(11)
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
    expect(migrationSql).not.toContain("'SUPER_ADMIN'")
    expect(migrationSql).not.toContain("'DEFAULT'")
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

  it('adds persistent API request logs and the administrator read permission', () => {
    const migrationSql = apiLogMigrationSql()

    expect(migrationSql).toContain('CREATE TABLE IF NOT EXISTS "sys_api_request_logs"')
    expect(migrationSql).toContain('"expires_at" timestamp with time zone')
    expect(migrationSql).toContain('"sys_api_request_logs_expires_at_index"')
    expect(migrationSql).toContain("'api_logs.read'")
    expect(migrationSql).not.toContain('DROP COLUMN')
  })

  it('adds the operations monitoring menu and administrator access to API logs', () => {
    const migrationSql = apiLogNavigationMigrationSql()

    expect(migrationSql).toContain("'运维监控', '/ops', '', 'AdminLayout'")
    expect(migrationSql).toContain("'接口日志', 'api-logs', 'api-logs'")
    expect(migrationSql).toContain("'api_logs.read'")
    expect(migrationSql).toContain('INSERT INTO "sys_role_menus"')
    expect(migrationSql).toContain('INSERT INTO "sys_role_permissions"')
    expect(migrationSql).not.toContain('DROP')
  })

  it('appends the about project menu after the existing root menus', () => {
    const migrationSql = aboutProjectMigrationSql()

    expect(migrationSql).toContain("'/about', 'about', 'AdminLayout'")
    expect(migrationSql).toContain("'关于项目'")
    expect(migrationSql).toContain("'book', 999, 'menu', true")
    expect(migrationSql).toContain('WHERE NOT EXISTS')
    expect(migrationSql).not.toContain('required_permission_key')
    expect(migrationSql).not.toContain('DROP')
  })
})
