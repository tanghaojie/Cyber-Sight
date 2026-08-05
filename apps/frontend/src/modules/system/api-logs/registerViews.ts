import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const apiLogsPage: RouteComponent = () => import('./pages/ApiLogsPage.vue')

// 向数据库菜单可选组件目录登记只读接口日志页面。
export function registerViews(appViews: ViewRegistrar): void {
  appViews.register(
    'api-logs',
    { key: 'api-logs.views.apiLogs', fallback: '接口日志' },
    apiLogsPage,
  )
}
