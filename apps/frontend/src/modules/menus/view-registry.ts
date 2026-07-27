import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '../../shared/routing/view-registry.js'

const menusPage: RouteComponent = () => import('./pages/MenusPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('menus', menusPage)
}
