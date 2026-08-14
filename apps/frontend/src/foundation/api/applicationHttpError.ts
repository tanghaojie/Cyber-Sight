import type { GlobalHttpErrorDetail, GlobalHttpErrorHandler } from './globalHttpError'
import { translate } from '@/foundation/modules/localization/localization'

export interface ApplicationHttpErrorActions {
  currentRoute(): { name?: string; fullPath: string }
  clearSession(): void
  clearNavigation(): void
  clearRoutes(): void
  replace(location: { name: string; query?: Record<string, string> }): Promise<unknown>
  showError(message: string): void
}

export function createApplicationHttpErrorHandler(
  actions: ApplicationHttpErrorActions,
): GlobalHttpErrorHandler {
  return async function applicationHttpErrorHandler(detail: GlobalHttpErrorDetail) {
    const current = actions.currentRoute()
    if (detail.httpStatus === 401) {
      // 会话失效时必须同时清除身份、导航数据和动态路由，避免旧权限残留在客户端。
      actions.clearSession()
      actions.clearNavigation()
      actions.clearRoutes()
      if (current.name !== 'login') {
        await actions.replace({ name: 'login', query: { redirect: current.fullPath } })
      }
      return
    }
    if (detail.httpStatus === 404) {
      // 保存来源路径到查询参数，错误页可展示或用于后续诊断。
      if (current.name !== 'not-found') {
        await actions.replace({ name: 'not-found', query: { from: current.fullPath } })
      }
      return
    }
    // 500 不切换路由，保留用户当前上下文并给出一次全局提示。
    actions.showError(translate('navigation.errors.serviceUnavailable'))
  }
}
