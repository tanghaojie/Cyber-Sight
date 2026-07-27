import type { RouteComponent } from 'vue-router'

export const rolesPage: RouteComponent = () => import('./pages/RolesPage.vue')
export { listRoleOptions, type RoleOption } from './roles.api.js'
