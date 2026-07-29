import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const menusPage: RouteComponent = () => import('./pages/MenusPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('menus', '菜单管理', menusPage)
}
