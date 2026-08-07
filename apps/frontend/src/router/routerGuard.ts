import { type RouteLocationNormalized, type Router } from 'vue-router'
import { pinia } from '@/stores/pinia'
import { useAuthStore } from '@/modules/system/auth/auth.store'
import { useNavigationStore } from '@/modules/system/navigation/navigation.store'
import { installMenuRoutes, routesReady } from './dynamicRoutes'
import { resolveRootEntry } from './rootEntry'

export async function authenticationRouteGuard(to: RouteLocationNormalized, router: Router) {
  const auth = useAuthStore(pinia)
  const navigation = useNavigationStore(pinia)

  if (to.meta.public) {
    if (to.name === 'login' && auth.isAuthenticated) {
      return '/'
    }
    return true
  }

  // 每次刷新仅恢复一次当前用户；Store 的 checked 标记负责合并后续守卫调用。
  await auth.fetchCurrentUser()

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (!routesReady) {
    // 首次认证导航先拉菜单再注册路由，然后重放目标地址让 Router 重新匹配新记录。
    await navigation.load()
    installMenuRoutes(router, navigation.items)
    if (to.path === '/') {
      return resolveRootEntry(router)
    }
    return to.fullPath
  }
  if (to.path === '/' && to.meta.rootEntry !== true) {
    return resolveRootEntry(router)
  }
  return true
}
