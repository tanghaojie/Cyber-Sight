import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { argv, cwd, exit } from 'node:process'
import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

function git(args, options = {}) {
  const result = spawnSync('git', args, {
    cwd: options.cwd ?? cwd(),
    encoding: 'utf8',
    stdio: options.capture === false ? 'inherit' : 'pipe',
  })
  if (options.allowFailure !== true && result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join('\n').trim()
    throw new Error(`git ${args.join(' ')} failed${detail ? `:\n${detail}` : ''}`)
  }
  return result
}

function normalized(path) {
  return path.replaceAll('\\', '/')
}

function matches(path, rule) {
  return rule.endsWith('/') ? path.startsWith(rule) : path === rule
}

export function classifyPath(path, manifest) {
  const candidate = normalized(path)
  for (const scope of ['platform', 'forge', 'foundation', 'integration']) {
    if (manifest[scope].some((rule) => matches(candidate, rule))) {
      return scope
    }
  }
  return 'unknown'
}

export function parseManifest(content) {
  try {
    return JSON.parse(content)
  } catch {
    const manifest = {}
    let section
    for (const rawLine of content.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) {
        continue
      }
      if (/^[a-z]+:$/.test(line)) {
        section = line.slice(0, -1)
        manifest[section] = []
        continue
      }
      if (!section || !line.startsWith('- ')) {
        throw new Error(`Invalid .forge-sync.yml line: ${rawLine}`)
      }
      manifest[section].push(line.slice(2).trim())
    }
    return manifest
  }
}

function changedPaths(ref) {
  const result = git(['diff', '--name-only', '--diff-filter=ACDMRT', `HEAD...${ref}`])
  return result.stdout
    .split(/\r?\n/)
    .map((path) => normalized(path.trim()))
    .filter(Boolean)
}

function headContains(path) {
  return git(['cat-file', '-e', `HEAD:${path}`], { allowFailure: true }).status === 0
}

function preservePlatform(paths) {
  for (const path of paths) {
    if (headContains(path)) {
      git(['restore', '--source=HEAD', '--staged', '--worktree', '--', path])
    } else {
      git(['rm', '-r', '--ignore-unmatch', '--', path])
    }
  }
}

function removeForge(paths) {
  for (const path of paths) {
    git(['rm', '-r', '--ignore-unmatch', '--', path])
  }
}

function runValidation(commands) {
  for (const command of commands) {
    console.log(`\n[forge-sync] validate: ${command}`)
    const result = spawnSync(command, { cwd: cwd(), shell: true, stdio: 'inherit' })
    if (result.status !== 0) {
      throw new Error(`Validation failed (${result.status}): ${command}`)
    }
  }
}

function printReport(paths, manifest) {
  const grouped = new Map()
  for (const path of paths) {
    const scope = classifyPath(path, manifest)
    grouped.set(scope, [...(grouped.get(scope) ?? []), path])
  }
  console.log('\n[forge-sync] ownership report')
  for (const scope of ['foundation', 'integration', 'platform', 'forge', 'unknown']) {
    const entries = grouped.get(scope) ?? []
    console.log(`- ${scope}: ${entries.length}`)
    for (const path of entries) {
      console.log(`  ${path}`)
    }
  }
}

async function main() {
  const refIndex = argv.indexOf('--upstream-ref')
  if (refIndex === -1 || !argv[refIndex + 1]) {
    throw new Error('Usage: pnpm forge:sync -- --upstream-ref <forge-ref>')
  }
  const upstreamRef = argv[refIndex + 1]
  const manifestPath = resolve(cwd(), '.forge-sync.yml')
  const manifest = parseManifest(await readFile(manifestPath, 'utf8'))

  const status = git(['status', '--porcelain']).stdout.trim()
  if (status) {
    throw new Error('Forge sync requires a clean worktree and index')
  }
  git(['rev-parse', '--verify', `${upstreamRef}^{commit}`])

  const incomingPaths = changedPaths(upstreamRef)
  printReport(incomingPaths, manifest)
  const unknown = incomingPaths.filter((path) => classifyPath(path, manifest) === 'unknown')
  if (unknown.length > 0) {
    throw new Error('Unknown paths must be classified in .forge-sync.yml before merging')
  }

  const merge = git(['merge', '--no-ff', '--no-commit', upstreamRef], { allowFailure: true })
  if (merge.status !== 0) {
    const conflicts = git(['diff', '--name-only', '--diff-filter=U'])
      .stdout.split(/\r?\n/)
      .map((path) => normalized(path.trim()))
      .filter(Boolean)
    const unsafeConflicts = conflicts.filter((path) => {
      const scope = classifyPath(path, manifest)
      return scope !== 'platform' && scope !== 'forge'
    })
    if (unsafeConflicts.length > 0) {
      throw new Error(
        `Foundation or integration conflicts require manual review:\n${unsafeConflicts.join('\n')}`,
      )
    }
    preservePlatform(conflicts.filter((path) => classifyPath(path, manifest) === 'platform'))
    removeForge(conflicts.filter((path) => classifyPath(path, manifest) === 'forge'))
  }

  preservePlatform(incomingPaths.filter((path) => classifyPath(path, manifest) === 'platform'))
  removeForge(incomingPaths.filter((path) => classifyPath(path, manifest) === 'forge'))

  const resultingPaths = git(['diff', '--name-only', 'HEAD'])
    .stdout.split(/\r?\n/)
    .map((path) => normalized(path.trim()))
    .filter(Boolean)
  printReport(resultingPaths, manifest)

  const resultUnknown = resultingPaths.filter((path) => classifyPath(path, manifest) === 'unknown')
  if (resultUnknown.length > 0) {
    throw new Error('Merge produced unclassified paths; inspect and abort the merge')
  }

  runValidation(manifest.validate)
  console.log('\n[forge-sync] validation passed; inspect the merge and create the merge commit')
}

if (argv[1] && import.meta.url === pathToFileURL(resolve(argv[1])).href) {
  main().catch((error) => {
    console.error(`[forge-sync] ${error instanceof Error ? error.message : String(error)}`)
    exit(1)
  })
}
