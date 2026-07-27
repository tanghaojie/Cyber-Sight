import type { RouteComponent } from 'vue-router'

export { useAuthStore } from './auth.store.js'
export const loginPage: RouteComponent = () => import('./pages/LoginPage.vue')
