import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const distDirectory = fileURLToPath(new URL('../dist/', import.meta.url))

async function findAliasReferences(directory) {
  const references = []
  const entries = await readdir(directory, { withFileTypes: true })

  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      references.push(...(await findAliasReferences(path)))
      continue
    }
    if (!entry.name.endsWith('.js') && !entry.name.endsWith('.d.ts')) continue

    const content = await readFile(path, 'utf8')
    if (content.includes('@/')) references.push(relative(distDirectory, path))
  }

  return references
}

const aliasReferences = await findAliasReferences(distDirectory)
if (aliasReferences.length > 0) {
  throw new Error(`Source alias remained in dist: ${aliasReferences.join(', ')}`)
}

await import('../dist/index.js')
