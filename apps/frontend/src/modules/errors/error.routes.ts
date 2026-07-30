import type { RouteComponent } from 'vue-router'

// 404 是静态懒加载页面，既可由 Router fallback 使用，也可由全局 HTTP 404 跳转。
export const notFoundPage: RouteComponent = () => import('./pages/NotFoundPage.vue')
