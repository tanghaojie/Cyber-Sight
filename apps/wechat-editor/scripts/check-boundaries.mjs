import { readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import ts from 'typescript'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const modulesRoot = resolve(root, 'src/platform/modules')
const interfaces = {
  article: ['article.model.ts', 'article.service.ts', 'article-editor.vue', 'article-preview.vue'],
  typesetting: ['typesetting.model.ts', 'typesetting.service.ts', 'typesetting-panel.vue'],
  ending: ['ending.model.ts', 'ending.service.ts', 'ending-panel.vue'],
  assets: ['assets.model.ts', 'assets.service.ts'],
  'wechat-export': ['wechat-export.model.ts', 'wechat-export.service.ts'],
  workspace: ['workspace.store.ts', 'draft-storage.port.ts', 'workspace.page.vue'],
}
const dependencies = {
  article: [],
  typesetting: [],
  ending: ['article'],
  assets: [],
  'wechat-export': ['article', 'typesetting', 'ending', 'assets'],
  workspace: ['article', 'typesetting', 'ending', 'assets', 'wechat-export'],
}
const failures = []
let files = 0
let imports = 0
function scan(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name)
    if (entry.isDirectory()) {
      scan(path)
      continue
    }
    if (!/\.(ts|vue)$/.test(path)) {
      continue
    }
    files++
    const owner = relative(modulesRoot, path).replaceAll('\\', '/').split('/')[0]
    const content = readFileSync(path, 'utf8')
    const script = path.endsWith('.vue')
      ? content.match(/<script[^>]*>([\s\S]*?)<\/script>/)?.[1] || ''
      : content
    const source = ts.createSourceFile(path, script, ts.ScriptTarget.Latest, true)
    function visit(node) {
      let specifier
      if (
        (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
        node.moduleSpecifier &&
        ts.isStringLiteral(node.moduleSpecifier)
      ) {
        specifier = node.moduleSpecifier.text
      }
      if (ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword) {
        if (node.arguments.length !== 1 || !ts.isStringLiteral(node.arguments[0])) {
          failures.push(`${relative(root, path)}: dynamic import must use a literal`)
          return
        }
        specifier = node.arguments[0].text
      }
      if (specifier) {
        imports++
        if (
          specifier.startsWith('@cyber-ai-forge/') ||
          specifier.includes('apps/frontend') ||
          specifier.includes('apps/backend')
        ) {
          failures.push(`${relative(root, path)}: forbidden application dependency ${specifier}`)
        }
        if (specifier.startsWith('.')) {
          const target = resolve(dirname(path), specifier)
          const targetPath = relative(modulesRoot, target).replaceAll('\\', '/')
          const [targetOwner, ...segments] = targetPath.split('/')
          if (relative(resolve(root, 'src'), target).startsWith('..')) {
            failures.push(`${relative(root, path)}: import escapes application source`)
          }
          if (interfaces[targetOwner] && targetOwner !== owner) {
            if (dependencies[owner] && !dependencies[owner].includes(targetOwner)) {
              failures.push(`${owner} may not depend on ${targetOwner}`)
            }
            const file = segments.join('/')
            if (
              !interfaces[targetOwner].some(
                (publicFile) => publicFile === file || publicFile === `${file}.ts`,
              )
            ) {
              failures.push(`${relative(root, path)}: private import ${specifier}`)
            }
          }
        }
      }
      ts.forEachChild(node, visit)
    }
    visit(source)
    if (entry.name === 'index.ts') {
      failures.push(`${relative(root, path)}: module barrel is forbidden`)
    }
    if (path.startsWith(modulesRoot) && !interfaces[owner]) {
      failures.push(`Unregistered module: ${owner}`)
    }
  }
}
scan(resolve(root, 'src'))
if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
} else {
  console.log(
    `JLab module boundaries passed: ${files} source files, ${imports} imports, six modules.`,
  )
}
