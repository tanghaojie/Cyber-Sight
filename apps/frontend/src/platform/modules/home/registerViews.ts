import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/foundation/shared/routing/view-registry'

const homePage: RouteComponent = () => import('./pages/HomePage.vue')

// 工作台与其他页面一样只通过数据库菜单按需注册。
export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('home', { key: 'home.views.home', fallback: '工作台总览' }, homePage)
}
