import type { RouteComponent } from 'vue-router'

export const usersPage: RouteComponent = () => import('./pages/UsersPage.vue')
