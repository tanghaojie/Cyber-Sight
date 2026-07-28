import { createRouter, createWebHistory } from 'vue-router'
import { notFoundPage } from '@/modules/errors/error.routes'
import constRoutes from './constRoutes'
import { authenticationRouteGuard } from './dynamicRoutes'

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
