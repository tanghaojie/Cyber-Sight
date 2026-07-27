import type { RouteComponent } from 'vue-router'

export const notFoundPage: RouteComponent = () => import('./pages/NotFoundPage.vue')
