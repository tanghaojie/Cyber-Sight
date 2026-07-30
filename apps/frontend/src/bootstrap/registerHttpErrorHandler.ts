import { ElMessage } from 'element-plus'
import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { createApplicationHttpErrorHandler } from '@/api/applicationHttpError'
import { installGlobalHttpErrorHandler } from '@/api/globalHttpError'
import { useAuthStore } from '@/modules/system/auth/auth.store'
import { useNavigationStore } from '@/modules/system/navigation/navigation.store'
import { clearDynamicRoutes } from '@/router/dynamicRoutes'

/** 把与框架无关的 HTTP 错误策略连接到 Router、Pinia 和 Element Plus。 */
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
