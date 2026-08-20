import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { classifyPath, parseManifest } from '../forge-sync.mjs'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const defaultRepositoryRoot = resolve(scriptDirectory, '../..')
const ownershipScopes = ['foundation', 'forge', 'platform']
const adrFilenamePattern = /^ADR-(?:\d{4}|\d{8})-.+\.md$/i

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function runGit(repositoryRoot, args, allowFailure = false) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })

  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || 'Git command failed').trim())
  }

  return (result.stdout || '').trim()
}

function getCurrentCommit(repositoryRoot) {
  return runGit(repositoryRoot, ['rev-parse', 'HEAD'])
}

function hasCommit(repositoryRoot, commit) {
  return Boolean(runGit(repositoryRoot, ['rev-parse', '--verify', `${commit}^{commit}`], true))
}

function hasPathAtCommit(repositoryRoot, commit, filePath) {
  return Boolean(runGit(repositoryRoot, ['rev-parse', '--verify', `${commit}:${filePath}`], true))
}

function listFiles(directoryPath) {
  if (!existsSync(directoryPath)) {
    return []
  }

  const files = []
  for (const entry of readdirSync(directoryPath, { withFileTypes: true })) {
    const entryPath = join(directoryPath, entry.name)
    if (entry.isDirectory()) {
      files.push(...listFiles(entryPath))
    } else if (entry.isFile()) {
      files.push(entryPath)
    }
  }

  return files
}

function parseFrontMatter(filePath) {
  const content = readFileSync(filePath, 'utf8')
  const match = content.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\s*\r?\n|$)/)
  const values = {}

  if (!match) {
    return values
  }

  for (const line of match[1].split(/\r?\n/)) {
    const separator = line.indexOf(':')
    if (separator === -1) {
      continue
    }

    const key = line.slice(0, separator).trim()
    const value = line
      .slice(separator + 1)
      .trim()
      .replace(/^['"]|['"]$/g, '')
    values[key] = value
  }

  return values
}

function toRepositoryPath(repositoryRoot, filePath) {
  return relative(repositoryRoot, filePath).replaceAll('\\', '/')
}

function splitScopes(value) {
  return String(value || '')
    .split(',')
    .map((scope) => scope.trim())
    .filter(Boolean)
}

function validateProfile(profile) {
  if (profile.version !== 2) {
    throw new Error('archive audit profile must use version 2')
  }

  if (!profile.repositoryRole || typeof profile.repositoryRole !== 'string') {
    throw new Error('archive audit profile must declare repositoryRole')
  }

  for (const key of ['managedScopes', 'inheritedScopes', 'excludedScopes']) {
    if (!Array.isArray(profile[key])) {
      throw new Error(`archive audit profile must declare ${key}`)
    }
  }

  if (!ownershipScopes.includes(profile.integrationOwner)) {
    throw new Error('archive audit profile has an invalid integrationOwner')
  }

  const assignments = new Map()
  for (const category of ['managedScopes', 'inheritedScopes', 'excludedScopes']) {
    for (const scope of profile[category]) {
      if (!ownershipScopes.includes(scope)) {
        throw new Error(`archive audit profile has an invalid scope: ${scope}`)
      }
      if (assignments.has(scope)) {
        throw new Error(`archive audit profile assigns ${scope} more than once`)
      }
      assignments.set(scope, category)
    }
  }

  for (const scope of ownershipScopes) {
    if (!assignments.has(scope)) {
      throw new Error(`archive audit profile does not assign ${scope}`)
    }
  }

  if (profile.excludedScopes.includes(profile.integrationOwner)) {
    throw new Error('integrationOwner cannot be excluded')
  }
}

function readRepositoryConfiguration(repositoryRoot) {
  const policyPath = join(repositoryRoot, 'docs/foundation/archive/archive-policy.json')
  const profilePath = join(repositoryRoot, '.archive-audit.json')
  const manifestPath = join(repositoryRoot, '.forge-sync.yml')
  const policy = readJson(policyPath)
  const profile = readJson(profilePath)
  const manifest = parseManifest(readFileSync(manifestPath, 'utf8'))

  if (policy.version !== 2 || policy.scope !== 'ownership') {
    throw new Error('archive policy must use version 2 ownership scope')
  }
  validateProfile(profile)

  return { manifest, policy, profile }
}

function resolveOwnershipScope(filePath, manifest, profile) {
  const classified = classifyPath(filePath, manifest)
  return classified === 'integration' ? profile.integrationOwner : classified
}

function getChangedPaths(repositoryRoot, commit) {
  const output = runGit(repositoryRoot, [
    'diff-tree',
    '--root',
    '--no-commit-id',
    '--name-only',
    '-r',
    commit,
  ])
  return output ? output.split(/\r?\n/).filter(Boolean) : []
}

function getCommitMessage(repositoryRoot, commit) {
  return runGit(repositoryRoot, ['show', '-s', '--format=%B', commit])
}

function describePath(filePath) {
  const moduleMatch = filePath.match(
    /^(?:apps\/[^/]+|packages\/api-contract)\/src\/(?:foundation|platform)\/modules\/([^/]+)/,
  )
  let component = 'repository'

  if (filePath.startsWith('apps/frontend/')) {
    component = 'frontend'
  } else if (filePath.startsWith('apps/backend/')) {
    component = 'backend'
  } else if (filePath.startsWith('packages/api-contract/')) {
    component = 'api-contract'
  } else if (filePath.startsWith('scripts/')) {
    component = 'tooling'
  } else if (filePath.startsWith('docs/')) {
    component = 'documentation'
  }

  return {
    component,
    module: moduleMatch?.[1],
  }
}

function getCommitsSince(repositoryRoot, baselineCommit, manifest, profile) {
  const output = runGit(repositoryRoot, [
    'log',
    '--no-merges',
    '--format=%H%x09%aI%x09%s',
    `${baselineCommit}..HEAD`,
  ])
  if (!output) {
    return []
  }

  return output.split(/\r?\n/).map((line) => {
    const [hash, authoredAt, subject] = line.split('\t')
    const paths = getChangedPaths(repositoryRoot, hash)
    const pathEvidence = paths.map((filePath) => ({
      path: filePath,
      ownerScope: resolveOwnershipScope(filePath, manifest, profile),
      ...describePath(filePath),
    }))
    const message = getCommitMessage(repositoryRoot, hash)
    return {
      hash,
      authoredAt,
      subject,
      paths: pathEvidence,
      ownerScopes: [
        ...new Set(
          pathEvidence
            .map((path) => path.ownerScope)
            .filter((scope) => ownershipScopes.includes(scope)),
        ),
      ].sort(),
      aiAttributed: /Co-Authored-By:\s*-AI-/i.test(message),
    }
  })
}

function isDocumentationPath(filePath) {
  return (
    filePath.startsWith('docs/') ||
    filePath.endsWith('.md') ||
    filePath.endsWith('.mdx') ||
    filePath === 'README.md' ||
    filePath === 'README.en.md'
  )
}

function isGeneratedOnlyPath(filePath) {
  return (
    filePath === 'pnpm-lock.yaml' ||
    filePath === 'package-lock.json' ||
    filePath === 'yarn.lock' ||
    filePath.startsWith('dist/') ||
    filePath.includes('/dist/')
  )
}

function isEffectivePath(filePath, policy) {
  if (isDocumentationPath(filePath) || isGeneratedOnlyPath(filePath)) {
    return false
  }

  return !policy.exclusions.pathPrefixes.some((prefix) => filePath.startsWith(prefix))
}

function isEffectiveCommitForScope(commit, scope, policy) {
  const subject = commit.subject.toLowerCase()
  const formattingOnly = policy.exclusions.subjectPatterns.some((pattern) =>
    new RegExp(pattern, 'i').test(subject),
  )

  if (formattingOnly) {
    return false
  }

  return commit.paths.some(
    (path) => path.ownerScope === scope && isEffectivePath(path.path, policy),
  )
}

function getNewAcceptedAdrs(repositoryRoot, scope, baselineCommit) {
  const decisionsDirectory = join(repositoryRoot, `docs/${scope}/decisions`)
  return listFiles(decisionsDirectory)
    .filter((filePath) => adrFilenamePattern.test(relative(decisionsDirectory, filePath)))
    .filter((filePath) => parseFrontMatter(filePath).status === 'accepted')
    .filter(
      (filePath) =>
        !hasPathAtCommit(
          repositoryRoot,
          baselineCommit,
          toRepositoryPath(repositoryRoot, filePath),
        ),
    )
    .map((filePath) => toRepositoryPath(repositoryRoot, filePath))
}

function getChangedPlanPaths(repositoryRoot, scope, baselineCommit) {
  const output = runGit(
    repositoryRoot,
    [
      'diff',
      '--name-only',
      `${baselineCommit}..HEAD`,
      '--',
      `docs/${scope}/plans/active`,
      `docs/${scope}/archive/plans`,
    ],
    true,
  )
  return output ? output.split(/\r?\n/).filter(Boolean) : []
}

function getCompletedPlans(repositoryRoot, scope, baselineCommit) {
  const changedPlanPaths = new Set(getChangedPlanPaths(repositoryRoot, scope, baselineCommit))
  const planFiles = [
    ...listFiles(join(repositoryRoot, `docs/${scope}/plans/active`)),
    ...listFiles(join(repositoryRoot, `docs/${scope}/archive/plans`)),
  ]

  return planFiles
    .filter((filePath) => extname(filePath).toLowerCase() === '.md')
    .filter((filePath) => changedPlanPaths.has(toRepositoryPath(repositoryRoot, filePath)))
    .filter((filePath) => parseFrontMatter(filePath).status === 'completed')
    .map((filePath) => toRepositoryPath(repositoryRoot, filePath))
}

function findActiveArchivePlans(repositoryRoot) {
  const plans = []

  for (const directoryScope of ownershipScopes) {
    const directory = join(repositoryRoot, `docs/${directoryScope}/plans/active`)
    for (const filePath of listFiles(directory)) {
      if (extname(filePath).toLowerCase() !== '.md') {
        continue
      }

      const frontMatter = parseFrontMatter(filePath)
      if (frontMatter.type !== 'documentation-archive-review') {
        continue
      }
      if (['completed', 'cancelled', 'superseded'].includes(frontMatter.status)) {
        continue
      }

      const scopes = new Set([
        frontMatter.scope || directoryScope,
        ...splitScopes(frontMatter.review_scopes || frontMatter.reviewScopes),
      ])
      plans.push({
        path: toRepositoryPath(repositoryRoot, filePath),
        directoryScope,
        status: frontMatter.status,
        scopes: [...scopes].filter((scope) => ownershipScopes.includes(scope)),
        baselineCommit: frontMatter.baseline_commit || frontMatter.baselineCommit,
      })
    }
  }

  return plans
}

function findSupersededAdrs(repositoryRoot, scope) {
  const decisionsDirectory = join(repositoryRoot, `docs/${scope}/decisions`)
  return listFiles(decisionsDirectory)
    .filter((filePath) => adrFilenamePattern.test(relative(decisionsDirectory, filePath)))
    .filter((filePath) =>
      ['superseded', 'replaced', 'retired'].includes(parseFrontMatter(filePath).status),
    )
    .map((filePath) => toRepositoryPath(repositoryRoot, filePath))
}

function isLocalDocumentationLink(target) {
  return target && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)
}

function findBrokenDocumentationLinks(repositoryRoot, manifest, profile) {
  const docsRoot = join(repositoryRoot, 'docs')
  const brokenLinks = []

  for (const filePath of listFiles(docsRoot)) {
    const repositoryPath = toRepositoryPath(repositoryRoot, filePath)
    if (repositoryPath.includes('/archive/')) {
      continue
    }

    if (extname(filePath).toLowerCase() !== '.md') {
      continue
    }

    const content = readFileSync(filePath, 'utf8')
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      let target = match[1].trim()
      if (target.startsWith('<') && target.endsWith('>')) {
        target = target.slice(1, -1)
      }

      target = target.split(/\s+/)[0].split('#')[0]
      if (!isLocalDocumentationLink(target)) {
        continue
      }

      let decodedTarget
      try {
        decodedTarget = decodeURI(target)
      } catch {
        decodedTarget = target
      }

      const targetPath = resolve(dirname(filePath), decodedTarget)
      if (!existsSync(targetPath)) {
        brokenLinks.push({
          file: repositoryPath,
          target: decodedTarget,
          ownerScope: resolveOwnershipScope(repositoryPath, manifest, profile),
        })
      }
    }
  }

  return brokenLinks
}

function matchesPathRule(filePath, rule) {
  return rule.endsWith('/') ? filePath.startsWith(rule) : filePath === rule
}

function detectArchitectureChanges(commits, scope, policy) {
  return commits.some((commit) => {
    const effectiveOwnerScopes = [
      ...new Set(
        commit.paths
          .filter((path) => isEffectivePath(path.path, policy))
          .map((path) => path.ownerScope)
          .filter((ownerScope) => ownershipScopes.includes(ownerScope)),
      ),
    ]

    return (
      (effectiveOwnerScopes.length >= 2 && effectiveOwnerScopes.includes(scope)) ||
      commit.paths.some(
        (path) =>
          path.ownerScope === scope &&
          policy.architecturePaths.some((rule) => matchesPathRule(path.path, rule)),
      )
    )
  })
}

function calculateDaysSince(dateValue, now) {
  if (!dateValue) {
    return null
  }

  const reviewedAt = new Date(dateValue)
  if (Number.isNaN(reviewedAt.getTime())) {
    return null
  }

  return Math.max(0, Math.floor((now.getTime() - reviewedAt.getTime()) / 86400000))
}

function readLedger(repositoryRoot, scope) {
  const ledgerPath = join(repositoryRoot, `docs/${scope}/archive/archive-ledger.json`)
  if (!existsSync(ledgerPath)) {
    throw new Error(`${scope} archive ledger is missing`)
  }

  const ledger = readJson(ledgerPath)
  if (ledger.version !== 2 || ledger.scope !== scope) {
    throw new Error(`${scope} archive ledger must use version 2 and matching scope`)
  }

  if (!ledger.lastReviewedCommit || !hasCommit(repositoryRoot, ledger.lastReviewedCommit)) {
    throw new Error(`${scope} archive ledger has no valid baseline`)
  }

  return ledger
}

function compactCommit(commit) {
  return {
    hash: commit.hash,
    authoredAt: commit.authoredAt,
    subject: commit.subject,
    ownerScopes: commit.ownerScopes,
    components: [...new Set(commit.paths.map((path) => path.component))].sort(),
    modules: [...new Set(commit.paths.map((path) => path.module).filter(Boolean))].sort(),
    aiAttributed: commit.aiAttributed,
  }
}

function buildManagedScopeReport({
  activePlans,
  brokenLinks,
  manifest,
  now,
  policy,
  profile,
  repositoryRoot,
  scope,
}) {
  let ledger
  try {
    ledger = readLedger(repositoryRoot, scope)
  } catch (error) {
    return {
      scope,
      ownership: 'managed',
      status: 'BLOCKED',
      due: false,
      reasons: [error.message],
      planDirectory: `docs/${scope}/plans/active`,
      activePlans: [],
    }
  }

  const commits = getCommitsSince(repositoryRoot, ledger.lastReviewedCommit, manifest, profile)
  const effectiveCommits = commits.filter((commit) =>
    isEffectiveCommitForScope(commit, scope, policy),
  )
  const acceptedAdrs = getNewAcceptedAdrs(repositoryRoot, scope, ledger.lastReviewedCommit)
  const completedPlans = getCompletedPlans(repositoryRoot, scope, ledger.lastReviewedCommit)
  const scopeBrokenLinks = brokenLinks.filter((link) => link.ownerScope === scope)
  const supersededAdrs = findSupersededAdrs(repositoryRoot, scope)
  const architectureChanged = detectArchitectureChanges(commits, scope, policy)
  const daysSinceReview = calculateDaysSince(ledger.lastReviewedAt, now)
  const reasons = []

  if (effectiveCommits.length >= policy.thresholds.effectiveCommits) {
    reasons.push(`${scope} effective commits reached ${effectiveCommits.length}`)
  }
  if (acceptedAdrs.length >= policy.thresholds.acceptedAdrs) {
    reasons.push(`${scope} accepted ADRs reached ${acceptedAdrs.length}`)
  }
  if (completedPlans.length >= policy.thresholds.completedFeatures) {
    reasons.push(`${scope} completed features reached ${completedPlans.length}`)
  }
  if (daysSinceReview !== null && daysSinceReview >= policy.thresholds.maxDaysSinceReview) {
    reasons.push(`${scope} days since last review reached ${daysSinceReview}`)
  }
  if (architectureChanged && policy.immediateTriggers.includes('architecture_change')) {
    reasons.push(`${scope} architecture change detected`)
  }
  if (scopeBrokenLinks.length > 0 && policy.immediateTriggers.includes('document_conflict')) {
    reasons.push(`${scope} broken documentation links detected: ${scopeBrokenLinks.length}`)
  }
  if (supersededAdrs.length > 0 && policy.immediateTriggers.includes('adr_superseded')) {
    reasons.push(`${scope} superseded ADRs remain current: ${supersededAdrs.length}`)
  }

  const matchingPlans = activePlans.filter(
    (plan) => profile.managedScopes.includes(plan.directoryScope) && plan.scopes.includes(scope),
  )
  const blockedPlan = matchingPlans.some((plan) => plan.status === 'blocked')
  const due = reasons.length > 0
  const status = blockedPlan
    ? 'BLOCKED'
    : due && matchingPlans.length > 0
      ? 'IN_PROGRESS'
      : due
        ? 'DUE'
        : 'NOT_DUE'

  return {
    scope,
    ownership: 'managed',
    status,
    due,
    baseline: {
      commit: ledger.lastReviewedCommit,
      reviewedAt: ledger.lastReviewedAt,
      daysSinceReview,
      reviewId: ledger.reviewId,
    },
    reasons,
    summary: {
      commitsSinceReview: commits.length,
      effectiveCommits: effectiveCommits.length,
      humanLikeEffectiveCommits: effectiveCommits.filter((commit) => !commit.aiAttributed).length,
      acceptedAdrs: acceptedAdrs.length,
      completedFeatures: completedPlans.length,
    },
    evidence: {
      commits: effectiveCommits.map(compactCommit),
      acceptedAdrs,
      completedPlans,
      brokenLinks: scopeBrokenLinks,
      supersededAdrs,
      architectureChanged,
    },
    planDirectory: `docs/${scope}/plans/active`,
    activePlans: matchingPlans,
  }
}

function buildInheritedScopeReport({ brokenLinks, repositoryRoot, scope }) {
  const scopeBrokenLinks = brokenLinks.filter((link) => link.ownerScope === scope)
  const supersededAdrs = findSupersededAdrs(repositoryRoot, scope)
  const reasons = []

  if (scopeBrokenLinks.length > 0) {
    reasons.push(`${scope} inherited documentation links are broken: ${scopeBrokenLinks.length}`)
  }
  if (supersededAdrs.length > 0) {
    reasons.push(`${scope} inherited superseded ADRs remain current: ${supersededAdrs.length}`)
  }

  return {
    scope,
    ownership: 'inherited',
    status: reasons.length > 0 ? 'UPSTREAM_REQUIRED' : 'INHERITED',
    due: false,
    reasons,
    evidence: {
      brokenLinks: scopeBrokenLinks,
      supersededAdrs,
    },
    upstreamAction:
      reasons.length > 0 ? 'Fix in Forge and synchronize Foundation again' : undefined,
  }
}

function aggregateStatus(scopeReports) {
  if (scopeReports.some((report) => report.status === 'BLOCKED')) {
    return 'BLOCKED'
  }
  if (scopeReports.some((report) => report.status === 'DUE')) {
    return 'DUE'
  }
  if (scopeReports.some((report) => report.status === 'UPSTREAM_REQUIRED')) {
    return 'UPSTREAM_REQUIRED'
  }
  if (scopeReports.some((report) => report.status === 'IN_PROGRESS')) {
    return 'IN_PROGRESS'
  }
  return 'NOT_DUE'
}

export function buildReport(options = {}) {
  const repositoryRoot = resolve(options.repositoryRoot || defaultRepositoryRoot)
  const now = options.now ? new Date(options.now) : new Date()
  const headCommit = getCurrentCommit(repositoryRoot)

  let configuration
  try {
    configuration = readRepositoryConfiguration(repositoryRoot)
  } catch (error) {
    return {
      version: 2,
      status: 'BLOCKED',
      due: false,
      upstreamRequired: false,
      generatedAt: now.toISOString(),
      headCommit,
      reasons: [error.message],
      scopes: {},
    }
  }

  const { manifest, policy, profile } = configuration
  const activePlans = findActiveArchivePlans(repositoryRoot)
  const brokenLinks = findBrokenDocumentationLinks(repositoryRoot, manifest, profile)
  const scopeReports = ownershipScopes.map((scope) => {
    if (profile.managedScopes.includes(scope)) {
      return buildManagedScopeReport({
        activePlans,
        brokenLinks,
        manifest,
        now,
        policy,
        profile,
        repositoryRoot,
        scope,
      })
    }

    if (profile.inheritedScopes.includes(scope)) {
      return buildInheritedScopeReport({ brokenLinks, repositoryRoot, scope })
    }

    return {
      scope,
      ownership: 'excluded',
      status: 'EXCLUDED',
      due: false,
      reasons: [],
    }
  })
  const status = aggregateStatus(scopeReports)

  return {
    version: 2,
    status,
    due: scopeReports.some((report) => report.ownership === 'managed' && report.due),
    upstreamRequired: scopeReports.some((report) => report.status === 'UPSTREAM_REQUIRED'),
    generatedAt: now.toISOString(),
    headCommit,
    repositoryRole: profile.repositoryRole,
    reasons: scopeReports.flatMap((report) => report.reasons),
    scopes: Object.fromEntries(scopeReports.map((report) => [report.scope, report])),
  }
}

export function shouldFailCi(report) {
  return report.status === 'BLOCKED' || report.due || report.upstreamRequired
}

function printHumanReport(report) {
  console.log(`Documentation archive status: ${report.status}`)
  if (report.repositoryRole) {
    console.log(`Repository role: ${report.repositoryRole}`)
  }
  console.log(`Current HEAD: ${report.headCommit}`)

  for (const scope of ownershipScopes) {
    const scopeReport = report.scopes?.[scope]
    if (!scopeReport) {
      continue
    }

    console.log(
      `- ${scope}: ${scopeReport.status} (${scopeReport.ownership}, due=${scopeReport.due})`,
    )
    for (const reason of scopeReport.reasons) {
      console.log(`  - ${reason}`)
    }
    for (const plan of scopeReport.activePlans || []) {
      console.log(`  - active plan: ${plan.path} (${plan.status})`)
    }
  }

  if (report.reasons?.length === 0) {
    console.log('Reasons: none')
  }
}

function main() {
  const args = new Set(process.argv.slice(2))
  const report = buildReport()

  if (args.has('--json')) {
    console.log(JSON.stringify(report, null, 2))
  } else {
    printHumanReport(report)
  }

  if (args.has('--fail-on-due') && shouldFailCi(report)) {
    process.exitCode = 10
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main()
  } catch (error) {
    console.error(`Documentation archive audit failed: ${error.message}`)
    process.exitCode = 1
  }
}
