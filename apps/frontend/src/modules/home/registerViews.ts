import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const homePage: RouteComponent = () => import('./pages/HomePage.vue')

// 首页已有静态路由，同时登记为可复用页面供数据库菜单按需引用。
export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('home', '工作台总览', homePage)
}
