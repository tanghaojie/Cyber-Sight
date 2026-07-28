import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface MigrationJournal {
  entries: Array<{ tag: string }>
}

function migrationSqlFiles(): string[] {
  const journalUrl = new URL('../drizzle/meta/_journal.json', import.meta.url)
  const journal = JSON.parse(
    readFileSync(journalUrl, 'utf8')
  ) as MigrationJournal
  return journal.entries.map(({ tag }) => readFileSync(
    new URL(`../drizzle/${tag}.sql`, import.meta.url),
    'utf8'
  ))
}

function migrationContaining(fragment: string): string {
  const migrationSql = migrationSqlFiles().find((sql) => sql.includes(fragment))
  if (!migrationSql) throw new Error(`Migration not found: ${fragment}`)
  return migrationSql
}

describe('database migrations', () => {
  it('removes the database-backed authentication session table', () => {
    const migrationSql = migrationContaining('DROP TABLE "auth_sessions"')

    expect(migrationSql).toContain('DROP TABLE "auth_sessions"')
  })

  it('adds a backwards-compatible layout identifier to menus', () => {
    const migrationSql = migrationContaining('ADD COLUMN "layout"')

    expect(migrationSql).toContain(
      `ALTER TABLE "menus" ADD COLUMN "layout" varchar(160) DEFAULT '' NOT NULL`,
    )
  })

  it('replaces the menu code constraint with an active-row unique index', () => {
    const migrationSql = migrationContaining('menus_code_active_unique')

    expect(migrationSql).toContain(
      'ALTER TABLE "menus" DROP CONSTRAINT "menus_code_unique"'
    )
    expect(migrationSql).toContain(
      'CREATE UNIQUE INDEX IF NOT EXISTS "menus_code_active_unique"'
    )
    expect(migrationSql).toContain(
      '("code") WHERE "menus"."is_deleted" = false'
    )
  })

  it('replaces every other business identity constraint with active-row indexes', () => {
    const migrationSql = migrationContaining('users_username_active_unique')

    for (const oldConstraint of [
      'roles_code_unique',
      'users_username_unique',
      'users_email_unique',
    ]) {
      expect(migrationSql).toContain(`DROP CONSTRAINT "${oldConstraint}"`)
    }
    for (const oldIndex of [
      'dictionaries_type_value_unique',
      'role_menus_role_menu_unique',
      'user_roles_user_role_unique',
    ]) {
      expect(migrationSql).toContain(`DROP INDEX IF EXISTS "${oldIndex}"`)
    }
    for (const activeIndex of [
      'dictionaries_type_value_active_unique',
      'role_menus_role_menu_active_unique',
      'roles_code_active_unique',
      'user_roles_user_role_active_unique',
      'users_username_active_unique',
      'users_email_active_unique',
    ]) {
      expect(migrationSql).toContain(
        `CREATE UNIQUE INDEX IF NOT EXISTS "${activeIndex}"`
      )
    }
    expect(migrationSql.match(/WHERE \"[^\"]+\"\.\"is_deleted\" = false/g)).toHaveLength(6)
    expect(migrationSql).not.toContain('auth_sessions_token_hash_unique')
  })
})
