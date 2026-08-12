import { readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const websiteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = resolve(websiteRoot, 'dist')
const serverRoot = resolve(websiteRoot, '.ssr')
const serverEntry = await import(pathToFileURL(resolve(serverRoot, 'entry-server.js')).href)

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
}

const pages = [
  { locale: 'en', source: 'index.html', output: 'index.html', assetPrefix: './' },
  { locale: 'zh', source: 'zh/index.html', output: 'zh/index.html', assetPrefix: '../' },
]

for (const page of pages) {
  const template = await readFile(resolve(distRoot, page.source), 'utf8')
  const appHtml = await serverEntry.render(page.locale)
  const seo = serverEntry.getSeoData(page.locale)
  const title = escapeHtml(seo.title)
  const description = escapeHtml(seo.description)
  const pageUrl = escapeHtml(seo.pageUrl)
  const html = template
    .replace('<div id="app"></div>', `<div id="app">${appHtml}</div>`)
    .replace(/<html lang="[^"]+">/, `<html lang="${seo.language}">`)
    .replace(/<title>.*?<\/title>/, `<title>${title}</title>`)
    .replace(/(<meta name="description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, `$1${title}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(" \/>)/, `$1${description}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(" \/>)/, `$1${pageUrl}$2`)
    .replace(/(<link rel="canonical" href=")[^"]*(" \/>)/, `$1${pageUrl}$2`)
    .replace(
      /(<script type="application\/ld\+json">)[\s\S]*?(<\/script>)/,
      `$1\n${JSON.stringify(seo.structuredData, null, 2)}\n$2`,
    )
    .replaceAll('src="/assets/', `src="${page.assetPrefix}assets/`)
    .replaceAll('href="/assets/', `href="${page.assetPrefix}assets/`)
    .replaceAll('src="/cyber-mark.svg"', `src="${page.assetPrefix}cyber-mark.svg"`)

  await writeFile(resolve(distRoot, page.output), html)
}

await rm(serverRoot, { recursive: true, force: true })
