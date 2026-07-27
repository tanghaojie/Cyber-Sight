import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

interface MigrationJournal {
  entries: Array<{ tag: string }>
}

function latestMigrationSql(): string {
  const journalUrl = new URL('../drizzle/meta/_journal.json', import.meta.url)
  const journal = JSON.parse(
    readFileSync(journalUrl, 'utf8')
  ) as MigrationJournal
  const latestTag = journal.entries.at(-1)?.tag
  if (!latestTag) throw new Error('Migration journal is empty')
  return readFileSync(
    new URL(`../drizzle/${latestTag}.sql`, import.meta.url),
    'utf8'
  )
}

describe('latest database migration', () => {
  it('replaces the menu code constraint with an active-row unique index', () => {
    const migrationSql = latestMigrationSql()

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
})
