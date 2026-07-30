import { createRouter, createWebHistory } from 'vue-router'
import { notFoundPage } from '@/modules/errors/error.routes'
import constRoutes from './constRoutes'
import { authenticationRouteGuard } from './routerGuard'

// 静态路由始终存在，数据库菜单路由会在认证守卫中按当前用户动态注册。
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
