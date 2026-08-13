import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/foundation/shared/routing/view-registry'

const dictionariesPage: RouteComponent = () => import('./pages/DictionariesPage.vue')

// 向数据库菜单可选组件目录登记字典管理页面。
export function registerViews(appViews: ViewRegistrar): void {
  appViews.register(
    'dictionaries',
    { key: 'dictionaries.views.dictionaries', fallback: '字典管理' },
    dictionariesPage,
  )
}
