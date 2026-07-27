import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '../../shared/routing/view-registry.js'

const rolesPage: RouteComponent = () => import('./pages/RolesPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('roles', rolesPage)
}
