import { readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface MigrationJournal {
  entries: Array<{ tag: string }>
}

function platformMigrationJournal(): MigrationJournal {
  const journalUrl = new URL('../../drizzle/platform/meta/_journal.json', import.meta.url)
  return JSON.parse(readFileSync(journalUrl, 'utf8')) as MigrationJournal
}

const foundationTableNames = [
  'sys_api_request_logs',
  'sys_auth_sessions',
  'sys_data_policy_departments',
  'sys_data_policy_rules',
  'sys_department_closure',
  'sys_departments',
  'sys_dictionaries',
  'sys_menus',
  'sys_permissions',
  'sys_positions',
  'sys_role_menus',
  'sys_role_permissions',
  'sys_roles',
  'sys_user_departments',
  'sys_user_positions',
  'sys_user_roles',
  'sys_users',
]

function migrationJournal(): MigrationJournal {
  const journalUrl = new URL('../../drizzle/foundation/meta/_journal.json', import.meta.url)
  return JSON.parse(readFileSync(journalUrl, 'utf8')) as MigrationJournal
}

function migrationFiles(): string[] {
  return readdirSync(new URL('../../drizzle/foundation/', import.meta.url))
    .filter((name) => name.endsWith('.sql'))
    .sort()
}

function snapshotFiles(): string[] {
  return readdirSync(new URL('../../drizzle/foundation/meta/', import.meta.url))
    .filter((name) => name.endsWith('_snapshot.json'))
    .sort()
}

function baselineMigrationSql(): string {
  const [entry] = migrationJournal().entries
  if (!entry) {
    throw new Error('No baseline migration found')
  }
  return readFileSync(new URL(`../../drizzle/foundation/${entry.tag}.sql`, import.meta.url), 'utf8')
}

describe('UUIDv7 database migration baseline', () => {
  it('contains one fresh migration and one matching snapshot', () => {
    const journal = migrationJournal()

    expect(journal.entries.map(({ tag }) => tag)).toEqual(['0000_initial_uuidv7_foundation_schema'])
    expect(migrationFiles()).toEqual(['0000_initial_uuidv7_foundation_schema.sql'])
    expect(snapshotFiles()).toEqual(['0000_snapshot.json'])
    expect(
      readdirSync(new URL('../../drizzle/platform/', import.meta.url)).filter((name) =>
        name.endsWith('.sql'),
      ),
    ).toEqual([])
    expect(platformMigrationJournal().entries).toEqual([])
  })

  it('creates all application tables directly in the single baseline', () => {
    const migrationSql = baselineMigrationSql()

    for (const tableName of foundationTableNames) {
      expect(migrationSql).toContain(`CREATE TABLE "${tableName}"`)
    }
    expect(migrationSql.match(/CREATE TABLE "sys_/g)).toHaveLength(foundationTableNames.length)
  })

  it('uses PostgreSQL-native UUIDv7 primary keys without numeric identity columns', () => {
    const migrationSql = baselineMigrationSql()

    expect(migrationSql.match(/"id" uuid PRIMARY KEY DEFAULT uuidv7\(\) NOT NULL/g)).toHaveLength(
      foundationTableNames.length,
    )
    expect(migrationSql).not.toMatch(/\b(?:smallserial|serial|bigserial)\b/i)
    expect(migrationSql).not.toMatch(/"[a-z_]+_id" integer/)
    expect(migrationSql).not.toContain('"parent_id" uuid DEFAULT')
    expect(migrationSql).not.toContain('"created_by" uuid DEFAULT')
    expect(migrationSql).not.toContain('"updated_by" uuid DEFAULT')
  })

  it('uses null roots and nullable UUID audit actors', () => {
    const migrationSql = baselineMigrationSql()

    expect(migrationSql).toContain('"parent_id" uuid,')
    expect(migrationSql).toContain("VALUES (NULL, '默认部门', 10, true)")
    expect(migrationSql).toContain("(NULL, '首页', '/', 'home', 'AdminLayout'")
    expect(migrationSql).toContain('"created_by" uuid,')
    expect(migrationSql).toContain('"updated_by" uuid')
    expect(migrationSql).not.toContain('"created_by" uuid NOT NULL')
    expect(migrationSql).not.toContain('"updated_by" uuid NOT NULL')
  })

  it('keeps the final soft-delete uniqueness and log indexes', () => {
    const migrationSql = baselineMigrationSql()

    expect(migrationSql.match(/CREATE UNIQUE INDEX "sys_/g)).toHaveLength(13)
    expect(migrationSql.match(/WHERE "sys_[^"]+"\."is_deleted" = false/g)).toHaveLength(15)
    expect(migrationSql).toContain('"sys_api_request_logs_expires_at_index"')
    expect(migrationSql).toContain('"sys_auth_sessions_token_hash_unique"')
  })

  it('seeds a complete administration baseline using generated UUIDs', () => {
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
    for (const permissionKey of [
      'users.manage',
      'roles.manage',
      'departments.manage',
      'positions.manage',
      'menus.manage',
      'dictionaries.manage',
      'api_logs.read',
      'home.read',
    ]) {
      expect(migrationSql).toContain(`'${permissionKey}'`)
    }
    expect(migrationSql).toContain("('read'), ('create'), ('update'), ('delete')")
  })

  it('seeds root and child navigation with UUID relationships', () => {
    const migrationSql = baselineMigrationSql()

    for (const rootPath of ['/', '/sys', '/config', '/ops', '/about']) {
      expect(migrationSql).toContain(`'${rootPath}'`)
    }
    for (const childPath of [
      'users',
      'roles',
      'departments',
      'positions',
      'menus',
      'dictionaries',
      'api-logs',
    ]) {
      expect(migrationSql).toContain(`'${childPath}'`)
    }
    expect(migrationSql).toContain('parent."id"')
    expect(migrationSql).not.toContain('(0,')
  })
})
