import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const departmentsPage: RouteComponent = () => import('./pages/DepartmentsPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('departments', '部门管理', departmentsPage)
}
