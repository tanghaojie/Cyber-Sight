import type { RouteComponent } from 'vue-router'
import type { ViewRegistrar } from '@/shared/routing/view-registry'

const aboutPage: RouteComponent = () => import('./pages/AboutPage.vue')

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('about', { key: 'about.pageLabel', fallback: '关于项目' }, aboutPage)
}
