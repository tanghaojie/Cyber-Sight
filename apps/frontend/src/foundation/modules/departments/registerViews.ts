import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/foundation/shared/routing/view-registry'

const departmentsPage: RouteComponent = () => import('./pages/DepartmentsPage.vue')

// 向数据库菜单可选组件目录登记部门管理页面。
export function registerViews(appViews: ViewRegistrar): void {
  appViews.register(
    'departments',
    { key: 'departments.views.departments', fallback: '部门管理' },
    departmentsPage,
  )
}
