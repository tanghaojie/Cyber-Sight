import type { GlobalHttpErrorDetail, GlobalHttpErrorHandler } from './globalHttpError.js'

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
      actions.clearSession()
      actions.clearNavigation()
      actions.clearRoutes()
      if (current.name !== 'login') {
        await actions.replace({ name: 'login', query: { redirect: current.fullPath } })
      }
      return
    }
    if (detail.httpStatus === 404) {
      if (current.name !== 'not-found') {
        await actions.replace({ name: 'not-found', query: { from: current.fullPath } })
      }
      return
    }
    actions.showError(detail.err || '服务暂时不可用，请稍后重试')
  }
}
