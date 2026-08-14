import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/foundation/shared/routing/view-registry'

const geoPage: RouteComponent = () => import('./pages/GeoWorkspacePage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('geo', { key: 'geo.views.workspace', fallback: 'Geo 空间工作台' }, geoPage)
}
