import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry.js'

const homePage: RouteComponent = () => import('./pages/HomePage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('home', '工作台总览', homePage)
}
