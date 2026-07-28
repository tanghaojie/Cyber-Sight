import { ElMessage } from 'element-plus'
import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { createApplicationHttpErrorHandler } from '@/api/applicationHttpError.js'
import { installGlobalHttpErrorHandler } from '@/api/globalHttpError.js'
import { useAuthStore } from '@/modules/auth/auth.store.js'
import { useNavigationStore } from '@/modules/navigation/navigation.store.js'
import { clearDynamicRoutes } from '@/router/dynamicRoutes.js'

export function registerHttpErrorHandler(router: Router, pinia: Pinia): void {
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
