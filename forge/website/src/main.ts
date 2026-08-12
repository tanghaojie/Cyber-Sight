import { createSSRApp } from 'vue'
import App from './App.vue'
import type { Locale } from './content'
import './styles.css'

function getLocaleFromPathname(pathname: string): Locale {
  return /\/zh(?:\/|$)/.test(pathname) ? 'zh' : 'en'
}

createSSRApp(App, {
  initialLocale: getLocaleFromPathname(window.location.pathname),
}).mount('#app')
