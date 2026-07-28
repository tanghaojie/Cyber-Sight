import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const dictionariesPage: RouteComponent = () => import('./pages/DictionariesPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('dictionaries', '字典管理', dictionariesPage)
}
