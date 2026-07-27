import { createRouter, createWebHistory, type RouteRecordRaw, type Router } from 'vue-router'
import type { NavigationMenu } from '@scaffold/api-contract'
import { pinia } from '../stores/pinia.js'
import { loginPage } from '../modules/auth/auth.routes.js'
import { useAuthStore } from '../modules/auth/auth.store.js'
import { notFoundPage } from '../modules/errors/error.routes.js'
import { useNavigationStore } from '../modules/navigation/navigation.store.js'
import { viewRegistry } from './view-registry.js'

const dynamicRouteRemovers: Array<() => void> = []
let routesReady = false

function flatten(nodes: NavigationMenu[]): NavigationMenu[] {
  return nodes.flatMap((node) => [node, ...flatten(node.children)])
}

function childPath(path: string): string {
  return path === '/' ? '' : path.replace(/^\/+/, '')
}

export function installMenuRoutes(targetRouter: Router, nodes: NavigationMenu[]): number {
  clearDynamicRoutes()
  const seenPaths = new Set<string>()
  for (const node of flatten(nodes)) {
    if (node.type !== 'menu' || !node.path || seenPaths.has(node.path)) continue
    const component = viewRegistry[node.component]
    if (!component) continue
    seenPaths.add(node.path)
    const route: RouteRecordRaw = {
      path: childPath(node.path),
      name: `menu-${node.id}`,
      component,
      meta: {
        title: node.name,
        eyebrow: node.code.replaceAll('_', ' / '),
        menuId: node.id,
      },
    }
    dynamicRouteRemovers.push(targetRouter.addRoute('admin-root', route))
  }
  routesReady = true
  return dynamicRouteRemovers.length
}

export function clearDynamicRoutes(): void {
  for (const remove of dynamicRouteRemovers.splice(0)) remove()
  routesReady = false
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/login', name: 'login', component: loginPage, meta: { public: true, title: '登录' } },
    { path: '/404', name: 'not-found', component: notFoundPage, meta: { public: true, title: '页面未找到' } },
    { path: '/', name: 'admin-root', component: () => import('../layouts/AdminLayout.vue'), children: [] },
    { path: '/:pathMatch(.*)*', name: 'dynamic-fallback', component: notFoundPage },
  ],
})

router.beforeEach(async function authenticationGuard(to) {
  const auth = useAuthStore(pinia)
  const navigation = useNavigationStore(pinia)
  if (to.meta.public) {
    if (to.name === 'login' && auth.isAuthenticated) return '/'
    return true
  }
  await auth.fetchCurrentUser()
  if (!auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  if (!routesReady) {
    await navigation.load()
    installMenuRoutes(router, navigation.items)
    return to.fullPath
  }
  if (to.name === 'dynamic-fallback') {
    return { name: 'not-found', query: { from: to.fullPath } }
  }
  return true
})

export default router
