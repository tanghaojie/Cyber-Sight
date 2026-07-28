import { createApp } from 'vue'
import { ElMessage } from 'element-plus'
import App from './App.vue'
import router, { clearDynamicRoutes } from './router/index.js'
import { pinia } from './stores/pinia.js'
import { useAuthStore } from './modules/auth/auth.store.js'
import { useNavigationStore } from './modules/navigation/navigation.store.js'
import { installGlobalHttpErrorHandler } from './api/global-http-error.js'
import { createApplicationHttpErrorHandler } from './api/application-http-error.js'
import { appConfig } from './config/app.config.js'
import 'virtual:svg-icons-register'
import './styles/main.scss'

const app = createApp(App)
app.use(pinia)
app.use(router)
document.title = appConfig.name

installGlobalHttpErrorHandler(
  createApplicationHttpErrorHandler({
    currentRoute() {
      return {
        name:
          typeof router.currentRoute.value.name === 'string'
            ? router.currentRoute.value.name
            : undefined,
        fullPath: router.currentRoute.value.fullPath,
      }
    },
    clearSession() {
      const auth = useAuthStore(pinia)
      auth.clearSession()
    },
    clearNavigation() {
      const navigation = useNavigationStore(pinia)
      navigation.clear()
    },
    clearRoutes() {
      clearDynamicRoutes()
    },
    replace(location) {
      return router.replace(location)
    },
    showError(message) {
      ElMessage.error(message)
    },
  }),
)

app.mount('#app')
