import { readFileSync } from 'node:fs'
import { spawnSync } from 'node:child_process'
import { argv, exit } from 'node:process'

export const commitTypes = [
  'chore',
  'docs',
  'feat',
  'fix',
  'refactor',
  'style',
  'test',
  'ci',
  'build',
  'revert',
]

const commitHeaderPattern = new RegExp(
  `^(${commitTypes.join('|')})(?:\\([a-z0-9][a-z0-9._/-]*\\))?!?:\\s+\\S.*$`,
)

function validationError(header) {
  return new Error(
    `Invalid commit title: ${header || '(empty)'}\\n` +
      `Use <type>(<scope>)?!: <summary>; allowed types: ${commitTypes.join(', ')}`,
  )
}

export function validateCommitMessage(message) {
  const header = String(message).split(/\r?\n/, 1)[0].trim()
  if (!commitHeaderPattern.test(header)) {
    throw validationError(header)
  }
  return header
}

function git(args) {
  const result = spawnSync('git', args, { encoding: 'utf8' })
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || 'Git command failed').trim())
  }
  return result.stdout
}

export function validateCommitRange(range) {
  if (!range) {
    throw new Error('A commit range is required, for example: HEAD~1..HEAD')
  }

  const records = git(['log', '--format=%H%x1f%s%x1e', range])
    .split('\x1e')
    .map((record) => record.trim())
    .filter(Boolean)
    .map((record) => record.split('\x1f'))

  for (const [hash, subject] of records) {
    try {
      validateCommitMessage(subject)
    } catch (error) {
      throw new Error(`${hash}: ${error.message}`)
    }
  }

  return records.length
}

function main() {
  if (argv[2] === '--range') {
    const count = validateCommitRange(argv[3])
    console.log(`Validated ${count} commit title(s).`)
    return
  }

  if (!argv[2]) {
    throw new Error('Provide a commit message file or --range <base>..HEAD')
  }

  validateCommitMessage(readFileSync(argv[2], 'utf8'))
}

if (argv[1] && import.meta.url.endsWith(argv[1].replaceAll('\\', '/'))) {
  try {
    main()
  } catch (error) {
    console.error(`[commit-message] ${error instanceof Error ? error.message : String(error)}`)
    exit(1)
  }
}
