import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/foundation/shared/routing/view-registry'

const positionsPage: RouteComponent = () => import('./pages/PositionsPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register(
    'positions',
    { key: 'positions.views.positions', fallback: '岗位管理' },
    positionsPage,
  )
}
