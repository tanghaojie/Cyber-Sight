import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const menusPage: RouteComponent = () => import('./pages/MenusPage.vue')

// 向数据库菜单可选组件目录登记菜单管理页面。
export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('menus', '菜单管理', menusPage)
}
