import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '../../shared/routing/view-registry.js'

const usersPage: RouteComponent = () => import('./pages/UsersPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('users', '用户管理', usersPage)
}
