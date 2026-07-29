import { createRouter, createWebHistory } from 'vue-router'
import { notFoundPage } from '@/modules/errors/error.routes'
import constRoutes from './constRoutes'
import { authenticationRouteGuard } from './routerGuard'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...constRoutes,
    { path: '/:pathMatch(.*)*', name: 'fallback-not-found', component: notFoundPage },
  ],
})

router.beforeEach(async function guard(to, from) {
  return authenticationRouteGuard(to, router)
})

export default router
