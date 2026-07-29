import { type RouteLocationNormalized, type Router } from 'vue-router'
import { pinia } from '@/stores/pinia'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useNavigationStore } from '@/modules/navigation/navigation.store'
import { installMenuRoutes, routesReady } from './dynamicRoutes'

export async function authenticationRouteGuard(to: RouteLocationNormalized, router: Router) {
  const auth = useAuthStore(pinia)
  const navigation = useNavigationStore(pinia)

  if (to.meta.public) {
    if (to.name === 'login' && auth.isAuthenticated) {
      return '/'
    }
    return true
  }

  await auth.fetchCurrentUser()

  if (!auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (!routesReady) {
    await navigation.load()
    installMenuRoutes(router, navigation.items)
    return to.fullPath
  }
  return true
}
