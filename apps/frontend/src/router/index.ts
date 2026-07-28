import { createRouter, createWebHistory } from 'vue-router'
import { notFoundPage } from '@/modules/errors/error.routes.js'
import constRoutes from './constRoutes.js'
import { authenticationRouteGuard } from './dynamicRoutes.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...constRoutes,
    { path: '/:pathMatch(.*)*', name: 'dynamic-fallback', component: notFoundPage },
  ],
})

router.beforeEach(async function authenticationGuard(to) {
  return authenticationRouteGuard(to, router)
})

export default router
