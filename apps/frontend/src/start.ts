import { createApp, watchEffect } from 'vue'
import App from './App.vue'
import router from './foundation/router/index'
import { pinia } from './foundation/stores/pinia'
import { appConfig } from './platform/config/app.config'
import { installPlatform } from './platform/platform.register'
import 'virtual:svg-icons-register'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './foundation/styles/main.scss'
import { registerHttpErrorHandler } from './foundation/bootstrap/registerHttpErrorHandler'
import {
  currentLocale,
  localization,
  resolveLocalizedLabel,
  type LocalizedLabel,
} from './foundation/modules/localization/localization'
import { useSettingsStore } from './foundation/modules/settings/settings.store'

export function startApplication(): void {
  // 前端组合根：先安装 Platform，再安装状态、语言和路由。
  const app = createApp(App)
  installPlatform(app)
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
    const localizedTitle = router.currentRoute.value.meta.localizedTitle as
      LocalizedLabel | undefined
    const pageTitle = localizedTitle ? resolveLocalizedLabel(localizedTitle) : appConfig.fullName
    document.title = `${pageTitle} · ${appConfig.name}`
  })

  app.mount('#app')
}
