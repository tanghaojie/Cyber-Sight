import { createRouter, createWebHistory } from 'vue-router'
import { notFoundPage } from '@/modules/errors/error.routes.js'
import constRoutes from './constRoutes'
import { authenticationRouteGuard } from './dynamicRoutes'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    ...constRoutes,
    { path: '/:pathMatch(.*)*', name: 'dynamic-fallback', component: notFoundPage },
  ],
})

router.beforeEach(async (to, from, next) => {
  await authenticationRouteGuard(to, from, next, router)
})

export default router
