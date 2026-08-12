import { renderToString } from '@vue/server-renderer'
import { createSSRApp } from 'vue'
import App from './App.vue'
import { content, GITHUB_URL, type Locale } from './content'

const SITE_ORIGIN = 'https://tanghaojie.github.io/Cyber-AI-Forge'

export function getPageUrl(locale: Locale): string {
  return `${SITE_ORIGIN}${locale === 'zh' ? '/zh/' : '/'}`
}

export function getSeoData(locale: Locale) {
  const pageUrl = getPageUrl(locale)
  const isChinese = locale === 'zh'

  return {
    title: content[locale].meta.title,
    description: content[locale].meta.description,
    language: isChinese ? 'zh-CN' : 'en',
    pageUrl,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebSite',
          name: 'Cyber AI Forge',
          url: pageUrl,
          inLanguage: isChinese ? 'zh-CN' : 'en',
        },
        {
          '@type': 'SoftwareApplication',
          name: 'Cyber AI Forge',
          description: content[locale].meta.description,
          applicationCategory: 'DeveloperApplication',
          operatingSystem: 'Cross-platform',
          url: pageUrl,
          codeRepository: GITHUB_URL,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
          },
        },
      ],
    },
  }
}

export async function render(locale: Locale): Promise<string> {
  const app = createSSRApp(App, { initialLocale: locale })
  return renderToString(app)
}
