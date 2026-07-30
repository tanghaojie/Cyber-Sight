import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const usersPage: RouteComponent = () => import('./pages/UsersPage.vue')

// 向数据库菜单可选组件目录登记用户管理页面。
export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('users', '用户管理', usersPage)
}
