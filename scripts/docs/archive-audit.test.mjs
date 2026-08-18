import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'
import { buildReport, shouldFailCi } from './archive-audit.mjs'

function run(command, args, directory) {
  const result = spawnSync(command, args, { cwd: directory, encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout}\n${result.stderr}`)
  }
  return result.stdout.trim()
}

async function write(path, content) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, content)
}

async function writeJson(path, value) {
  await write(path, `${JSON.stringify(value, null, 2)}\n`)
}

function profile(role) {
  if (role === 'platform-downstream') {
    return {
      version: 2,
      repositoryRole: role,
      managedScopes: ['platform'],
      inheritedScopes: ['foundation'],
      excludedScopes: ['forge'],
      integrationOwner: 'foundation',
    }
  }

  return {
    version: 2,
    repositoryRole: 'forge-upstream',
    managedScopes: ['foundation', 'forge', 'platform'],
    inheritedScopes: [],
    excludedScopes: [],
    integrationOwner: 'foundation',
  }
}

async function repository(role) {
  const directory = await mkdtemp(join(tmpdir(), 'archive-audit-'))
  const policy = {
    version: 2,
    scope: 'ownership',
    thresholds: {
      effectiveCommits: 1,
      acceptedAdrs: 1,
      completedFeatures: 1,
      maxDaysSinceReview: 30,
    },
    immediateTriggers: ['architecture_change', 'document_conflict', 'adr_superseded'],
    architecturePaths: ['scripts/docs/'],
    exclusions: {
      pathPrefixes: [],
      subjectPatterns: ['^style(\\b|:)'],
    },
  }
  const manifest = {
    foundation: ['foundation/', 'docs/foundation/', 'scripts/'],
    platform: ['platform/', 'docs/platform/', '.archive-audit.json'],
    forge: ['forge/', 'docs/forge/'],
    integration: ['.forge-sync.yml', 'docs/README.md'],
    validate: [],
  }

  await writeJson(join(directory, '.archive-audit.json'), profile(role))
  await writeJson(join(directory, '.forge-sync.yml'), manifest)
  await writeJson(join(directory, 'docs/foundation/archive/archive-policy.json'), policy)
  for (const scope of ['foundation', 'forge', 'platform']) {
    await write(join(directory, `docs/${scope}/plans/active/README.md`), `# ${scope}\n`)
    await write(join(directory, `docs/${scope}/decisions/README.md`), `# ${scope}\n`)
  }

  run('git', ['init', '-b', 'master'], directory)
  run('git', ['config', 'user.email', 'test@example.com'], directory)
  run('git', ['config', 'user.name', 'Archive Audit Test'], directory)
  run('git', ['add', '.'], directory)
  run('git', ['commit', '-m', 'base'], directory)
  const baseline = run('git', ['rev-parse', 'HEAD'], directory)

  for (const scope of ['foundation', 'forge', 'platform']) {
    await writeJson(join(directory, `docs/${scope}/archive/archive-ledger.json`), {
      version: 2,
      scope,
      lastReviewedCommit: baseline,
      lastReviewedAt: '2026-08-18T00:00:00Z',
      reviewId: 'test-baseline',
    })
  }
  run('git', ['add', '.'], directory)
  run('git', ['commit', '-m', 'record ledgers'], directory)
  return directory
}

async function commitFile(directory, path, content, message) {
  await write(join(directory, path), content)
  run('git', ['add', '.'], directory)
  run('git', ['commit', '-m', message], directory)
}

test('Platform downstream creates only a Platform archive task', async () => {
  const directory = await repository('platform-downstream')
  try {
    await commitFile(
      directory,
      'platform/orders.ts',
      'export const order = true\n',
      'feat: add orders',
    )

    await write(
      join(directory, 'docs/foundation/plans/active/foundation-review.md'),
      '---\ntype: documentation-archive-review\nscope: foundation\nreview_scopes: foundation,platform\nstatus: active\n---\n',
    )
    let report = buildReport({ repositoryRoot: directory, now: '2026-08-18T12:00:00Z' })
    assert.equal(report.scopes.foundation.status, 'INHERITED')
    assert.equal(report.scopes.forge.status, 'EXCLUDED')
    assert.equal(report.scopes.platform.status, 'DUE')
    assert.equal(report.scopes.platform.planDirectory, 'docs/platform/plans/active')

    await write(
      join(directory, 'docs/platform/plans/active/platform-review.md'),
      '---\ntype: documentation-archive-review\nscope: platform\nstatus: active\n---\n',
    )
    report = buildReport({ repositoryRoot: directory, now: '2026-08-18T12:00:00Z' })
    assert.equal(report.status, 'IN_PROGRESS')
    assert.equal(report.scopes.platform.status, 'IN_PROGRESS')
    assert.equal(report.due, true)
    assert.equal(shouldFailCi(report), true)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('inherited Foundation defects require an upstream fix', async () => {
  const directory = await repository('platform-downstream')
  try {
    await write(
      join(directory, 'docs/foundation/design/current.md'),
      '# Current\n\n[Missing](missing.md)\n',
    )
    const report = buildReport({ repositoryRoot: directory, now: '2026-08-18T12:00:00Z' })
    assert.equal(report.status, 'UPSTREAM_REQUIRED')
    assert.equal(report.upstreamRequired, true)
    assert.equal(report.scopes.foundation.status, 'UPSTREAM_REQUIRED')
    assert.equal(report.scopes.platform.status, 'NOT_DUE')
    assert.equal(report.scopes.foundation.upstreamAction.includes('Forge'), true)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('a plan for one managed scope does not mask another due scope', async () => {
  const directory = await repository('forge-upstream')
  try {
    await write(join(directory, 'foundation/auth.ts'), 'export const auth = true\n')
    await write(join(directory, 'platform/orders.ts'), 'export const order = true\n')
    run('git', ['add', '.'], directory)
    run('git', ['commit', '-m', 'feat: change shared and platform code'], directory)
    await write(
      join(directory, 'docs/foundation/plans/active/foundation-review.md'),
      '---\ntype: documentation-archive-review\nscope: foundation\nstatus: active\n---\n',
    )

    const report = buildReport({ repositoryRoot: directory, now: '2026-08-18T12:00:00Z' })
    assert.equal(report.status, 'DUE')
    assert.equal(report.scopes.foundation.status, 'IN_PROGRESS')
    assert.equal(report.scopes.platform.status, 'DUE')
    assert.equal(report.scopes.forge.status, 'NOT_DUE')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('invalid repository role configuration blocks the audit', async () => {
  const directory = await repository('platform-downstream')
  try {
    await writeJson(join(directory, '.archive-audit.json'), {
      ...profile('platform-downstream'),
      managedScopes: ['platform', 'foundation'],
    })
    const report = buildReport({ repositoryRoot: directory, now: '2026-08-18T12:00:00Z' })
    assert.equal(report.status, 'BLOCKED')
    assert.match(report.reasons[0], /assigns foundation more than once/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})
