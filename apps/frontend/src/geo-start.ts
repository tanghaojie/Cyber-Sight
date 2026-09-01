import { createApp } from 'vue'
import GeoWorkspacePage from './platform/modules/geo/pages/GeoWorkspacePage.vue'
import { localization } from './foundation/modules/localization/localization'
import { installPlatform } from './platform/platform.register'
import { runtimeConfig } from './config/runtime.config'

export function startGeoApplication(): void {
  const app = createApp(GeoWorkspacePage)

  installPlatform(app)
  app.use(localization)
  document.title = `${runtimeConfig.platform.fullName} · Geo`
  app.mount('#app')
}
