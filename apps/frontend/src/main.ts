import { createApp, watchEffect } from 'vue'
import App from './App.vue'
import router from './router/index'
import { pinia } from './stores/pinia'
import { appConfig } from './config/app.config'
import 'virtual:svg-icons-register'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './styles/main.scss'
import { registerHttpErrorHandler } from './bootstrap/registerHttpErrorHandler'
import {
  currentLocale,
  localization,
  resolveLocalizedLabel,
  type LocalizedLabel,
} from './modules/system/localization/localization'
import { useSettingsStore } from './modules/system/settings/settings.store'

// 前端组合根：先安装状态、语言和路由，再注册依赖这些能力的全局副作用。
const app = createApp(App)
app.use(pinia)
app.use(localization)
app.use(router)

registerHttpErrorHandler(router, pinia)

const settings = useSettingsStore(pinia)

watchEffect(() => {
  if (!settings.settings.dynamicTitle) {
    document.title = appConfig.name
    return
  }

  // 显式读取当前语言，保证静态和动态路由标题在切换后同步刷新浏览器标签。
  currentLocale.value
  const localizedTitle = router.currentRoute.value.meta.localizedTitle as LocalizedLabel | undefined
  const pageTitle = localizedTitle ? resolveLocalizedLabel(localizedTitle) : appConfig.fullName
  document.title = `${pageTitle} · ${appConfig.name}`
})

app.mount('#app')
