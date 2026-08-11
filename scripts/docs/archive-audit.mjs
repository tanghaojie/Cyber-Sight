import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const repositoryRoot = resolve(scriptDirectory, '../..')
const policyPath = join(repositoryRoot, 'docs/archive/archive-policy.json')
const ledgerPath = join(repositoryRoot, 'docs/archive/archive-ledger.json')
const adrFilenamePattern = /^ADR-(?:\d{4}|\d{8})-.+\.md$/i

function readJson(filePath) {
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function runGit(args, allowFailure = false) {
  const result = spawnSync('git', args, {
    cwd: repositoryRoot,
    encoding: 'utf8',
  })

  if (result.status !== 0 && !allowFailure) {
    throw new Error((result.stderr || result.stdout || 'Git command failed').trim())
  }

  return (result.stdout || '').trim()
}

function getCurrentCommit() {
  return runGit(['rev-parse', 'HEAD'])
}

function hasCommit(commit) {
  return Boolean(runGit(['rev-parse', '--verify', `${commit}^{commit}`], true))
}

function hasPathAtCommit(commit, filePath) {
  return Boolean(runGit(['rev-parse', '--verify', `${commit}:${filePath}`], true))
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

function toRepositoryPath(filePath) {
  return relative(repositoryRoot, filePath).replaceAll('\\', '/')
}

function getChangedPaths(commit) {
  const output = runGit(['diff-tree', '--root', '--no-commit-id', '--name-only', '-r', commit])
  return output ? output.split(/\r?\n/).filter(Boolean) : []
}

function getCommitMessage(commit) {
  return runGit(['show', '-s', '--format=%B', commit])
}

function getCommitsSince(baselineCommit) {
  const output = runGit([
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
    const paths = getChangedPaths(hash)
    const message = getCommitMessage(hash)
    return {
      hash,
      authoredAt,
      subject,
      paths,
      scopes: getScopes(paths),
      aiAttributed: /Co-Authored-By:\s*-AI-/i.test(message),
    }
  })
}

function isDocumentationPath(filePath) {
  return (
    filePath.startsWith('docs/') ||
    filePath.endsWith('.md') ||
    filePath.endsWith('.mdx') ||
    filePath === 'README.md'
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

function isEffectiveCommit(commit, policy) {
  const effectivePaths = commit.paths.filter((filePath) => {
    if (isDocumentationPath(filePath) || isGeneratedOnlyPath(filePath)) {
      return false
    }

    return !policy.exclusions.pathPrefixes.some((prefix) => filePath.startsWith(prefix))
  })

  const subject = commit.subject.toLowerCase()
  const formattingOnly = policy.exclusions.subjectPatterns.some((pattern) =>
    new RegExp(pattern, 'i').test(subject),
  )

  return effectivePaths.length > 0 && !formattingOnly
}

function getScopes(paths) {
  const scopes = new Set()

  for (const filePath of paths) {
    const moduleMatch = filePath.match(
      /^(?:apps\/[^/]+|packages\/api-contract)\/src\/modules\/(?:system\/|biz\/)?([^/]+)/,
    )

    if (moduleMatch) {
      scopes.add(moduleMatch[1])
      continue
    }

    if (filePath.startsWith('apps/frontend/')) {
      scopes.add('frontend')
    } else if (filePath.startsWith('apps/backend/')) {
      scopes.add('backend')
    } else if (filePath.startsWith('packages/api-contract/')) {
      scopes.add('api-contract')
    } else if (filePath.startsWith('scripts/')) {
      scopes.add('tooling')
    }
  }

  return scopes.size > 0 ? [...scopes].sort() : ['repository']
}

function getNewAcceptedAdrs(baselineCommit) {
  const decisionsDirectory = join(repositoryRoot, 'docs/decisions')
  return listFiles(decisionsDirectory)
    .filter((filePath) => adrFilenamePattern.test(relative(decisionsDirectory, filePath)))
    .filter((filePath) => parseFrontMatter(filePath).status === 'accepted')
    .filter((filePath) => !hasPathAtCommit(baselineCommit, toRepositoryPath(filePath)))
    .map(toRepositoryPath)
}

function getChangedPlanPaths(baselineCommit) {
  const output = runGit(
    [
      'diff',
      '--name-only',
      `${baselineCommit}..HEAD`,
      '--',
      'docs/plans/active',
      'docs/archive/plans',
    ],
    true,
  )
  return output ? output.split(/\r?\n/).filter(Boolean) : []
}

function getCompletedPlans(baselineCommit) {
  const changedPlanPaths = new Set(getChangedPlanPaths(baselineCommit))
  const planFiles = [
    ...listFiles(join(repositoryRoot, 'docs/plans/active')),
    ...listFiles(join(repositoryRoot, 'docs/archive/plans')),
  ]

  return planFiles
    .filter((filePath) => extname(filePath).toLowerCase() === '.md')
    .filter((filePath) => changedPlanPaths.has(toRepositoryPath(filePath)))
    .filter((filePath) => parseFrontMatter(filePath).status === 'completed')
    .map(toRepositoryPath)
}

function findActiveArchivePlans() {
  return listFiles(join(repositoryRoot, 'docs/plans/active'))
    .filter((filePath) => extname(filePath).toLowerCase() === '.md')
    .map((filePath) => ({
      path: toRepositoryPath(filePath),
      ...parseFrontMatter(filePath),
    }))
    .filter((plan) => plan.type === 'documentation-archive-review')
}

function findSupersededAdrs() {
  return listFiles(join(repositoryRoot, 'docs/decisions'))
    .filter((filePath) =>
      adrFilenamePattern.test(relative(join(repositoryRoot, 'docs/decisions'), filePath)),
    )
    .filter((filePath) =>
      ['superseded', 'replaced', 'retired'].includes(parseFrontMatter(filePath).status),
    )
    .map(toRepositoryPath)
}

function isLocalDocumentationLink(target) {
  return target && !/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target)
}

function findBrokenDocumentationLinks() {
  const docsRoot = join(repositoryRoot, 'docs')
  const brokenLinks = []

  for (const filePath of listFiles(docsRoot)) {
    if (filePath.includes(`${join('docs', 'archive')}`)) {
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
          file: toRepositoryPath(filePath),
          target: decodedTarget,
        })
      }
    }
  }

  return brokenLinks
}

function detectArchitectureChanges(commits) {
  const architecturePaths = new Set([
    'docs/design/system-overview.md',
    'docs/design/module-boundaries.md',
  ])

  return commits.some(
    (commit) =>
      commit.paths.some((filePath) => architecturePaths.has(filePath)) || commit.scopes.length >= 2,
  )
}

function calculateDaysSince(dateValue) {
  if (!dateValue) {
    return null
  }

  const reviewedAt = new Date(dateValue)
  if (Number.isNaN(reviewedAt.getTime())) {
    return null
  }

  return Math.max(0, Math.floor((Date.now() - reviewedAt.getTime()) / 86400000))
}

function buildReport() {
  const policy = readJson(policyPath)
  const ledger = readJson(ledgerPath)
  const headCommit = getCurrentCommit()
  const baseline = ledger.scopes.repository

  if (!baseline || !hasCommit(baseline.lastReviewedCommit)) {
    return {
      status: 'BLOCKED',
      due: false,
      generatedAt: new Date().toISOString(),
      headCommit,
      reasons: ['archive ledger has no valid repository baseline'],
    }
  }

  const commits = getCommitsSince(baseline.lastReviewedCommit)
  const effectiveCommits = commits.filter((commit) => isEffectiveCommit(commit, policy))
  const scopeCounts = {}

  for (const commit of effectiveCommits) {
    for (const scope of commit.scopes) {
      scopeCounts[scope] = (scopeCounts[scope] || 0) + 1
    }
  }

  const newAcceptedAdrs = getNewAcceptedAdrs(baseline.lastReviewedCommit)
  const completedPlans = getCompletedPlans(baseline.lastReviewedCommit)
  const activeArchivePlans = findActiveArchivePlans()
  const supersededAdrs = findSupersededAdrs()
  const brokenLinks = findBrokenDocumentationLinks()
  const architectureChanged = detectArchitectureChanges(commits)
  const daysSinceReview = calculateDaysSince(baseline.lastReviewedAt)
  const reasons = []

  const thresholdScopes = Object.entries(scopeCounts).filter(
    ([, count]) => count >= policy.thresholds.effectiveCommits,
  )

  for (const [scope, count] of thresholdScopes) {
    reasons.push(`${scope} effective commits reached ${count}`)
  }

  if (newAcceptedAdrs.length >= policy.thresholds.acceptedAdrs) {
    reasons.push(`accepted ADRs reached ${newAcceptedAdrs.length}`)
  }

  if (completedPlans.length >= policy.thresholds.completedFeatures) {
    reasons.push(`completed features reached ${completedPlans.length}`)
  }

  if (daysSinceReview !== null && daysSinceReview >= policy.thresholds.maxDaysSinceReview) {
    reasons.push(`days since last review reached ${daysSinceReview}`)
  }

  if (architectureChanged && policy.immediateTriggers.includes('architecture_change')) {
    reasons.push('architecture change detected')
  }

  if (brokenLinks.length > 0 && policy.immediateTriggers.includes('document_conflict')) {
    reasons.push(`broken documentation links detected: ${brokenLinks.length}`)
  }

  if (supersededAdrs.length > 0 && policy.immediateTriggers.includes('adr_superseded')) {
    reasons.push(`superseded ADRs remain current: ${supersededAdrs.length}`)
  }

  const activeBlocked = activeArchivePlans.some((plan) => plan.status === 'blocked')
  const due = reasons.length > 0
  const status = activeBlocked
    ? 'BLOCKED'
    : activeArchivePlans.length > 0
      ? 'IN_PROGRESS'
      : due
        ? 'DUE'
        : 'NOT_DUE'

  return {
    status,
    due,
    generatedAt: new Date().toISOString(),
    headCommit,
    baseline: {
      commit: baseline.lastReviewedCommit,
      reviewedAt: baseline.lastReviewedAt,
      daysSinceReview,
    },
    reasons,
    summary: {
      commitsSinceReview: commits.length,
      effectiveCommits: effectiveCommits.length,
      humanLikeEffectiveCommits: effectiveCommits.filter((commit) => !commit.aiAttributed).length,
      acceptedAdrs: newAcceptedAdrs.length,
      completedFeatures: completedPlans.length,
      scopeCounts,
    },
    evidence: {
      commits: effectiveCommits.map((commit) => ({
        hash: commit.hash,
        authoredAt: commit.authoredAt,
        subject: commit.subject,
        scopes: commit.scopes,
        aiAttributed: commit.aiAttributed,
      })),
      acceptedAdrs: newAcceptedAdrs,
      completedPlans,
      brokenLinks,
      supersededAdrs,
      architectureChanged,
    },
    activePlans: activeArchivePlans.map((plan) => ({
      path: plan.path,
      status: plan.status,
      scope: plan.scope,
      baselineCommit: plan.baseline_commit || plan.baselineCommit,
    })),
  }
}

function printHumanReport(report) {
  console.log(`Documentation archive status: ${report.status}`)
  if (report.baseline) {
    console.log(`Baseline: ${report.baseline.commit}`)
    console.log(`Current HEAD: ${report.headCommit}`)
  }

  if (report.reasons?.length > 0) {
    console.log('Reasons:')
    for (const reason of report.reasons) {
      console.log(`- ${reason}`)
    }
  } else {
    console.log('Reasons: none')
  }

  if (report.summary) {
    console.log(
      `Evidence: ${report.summary.effectiveCommits} effective commits, ` +
        `${report.summary.acceptedAdrs} accepted ADRs, ` +
        `${report.summary.completedFeatures} completed features`,
    )
  }

  if (report.activePlans?.length > 0) {
    console.log('Active archive plans:')
    for (const plan of report.activePlans) {
      console.log(`- ${plan.path} (${plan.status})`)
    }
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

  if (args.has('--fail-on-due') && (report.status === 'DUE' || report.status === 'BLOCKED')) {
    process.exitCode = 10
  }
}

try {
  main()
} catch (error) {
  console.error(`Documentation archive audit failed: ${error.message}`)
  process.exitCode = 1
}
