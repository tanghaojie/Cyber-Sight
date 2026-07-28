import { installGlobalHttpErrorHandler } from './globalHttpError.js'
import { createApplicationHttpErrorHandler } from './applicationHttpError.js'
import { Router } from 'vue-router'
import { Pinia } from 'pinia'
import { ElMessage } from 'element-plus'
import { clearDynamicRoutes } from '@/router/dynamicRoutes.js'
import { useAuthStore } from '@/modules/auth/auth.store.js'
import { useNavigationStore } from '@/modules/navigation/navigation.store.js'

export function registorHttpErrorHander(router: Router, pinia: Pinia) {
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
}
