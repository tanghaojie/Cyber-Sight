import {
  createRouter,
  createWebHistory,
  RouterView,
  type RouteComponent,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'
import type { NavigationMenu } from '@scaffold/api-contract'
import { pinia } from '../stores/pinia.js'
import { loginPage } from '../modules/auth/auth.routes.js'
import { useAuthStore } from '../modules/auth/auth.store.js'
import { notFoundPage } from '../modules/errors/error.routes.js'
import { useNavigationStore } from '../modules/navigation/navigation.store.js'
import { resolveMenuPath } from '../shared/routing/menu-paths.js'
import { DEFAULT_LAYOUT, layoutRegistry } from '../shared/routing/layout-registry.js'
import { viewRegistry } from './view-registry.js'

const dynamicRouteRemovers: Array<() => void> = []
let routesReady = false

function childPath(path: string): string {
  return path === '/' ? '' : path.replace(/^\/+/, '')
}

interface RouteRegistries {
  layouts?: Readonly<Record<string, RouteComponent>>
  views?: Readonly<
    Record<
      string,
      {
        label: string
        component: RouteComponent
      }
    >
  >
}

export function installMenuRoutes(
  targetRouter: Router,
  nodes: NavigationMenu[],
  registries: RouteRegistries = {},
): number {
  clearDynamicRoutes()
  const layouts = registries.layouts ?? layoutRegistry
  const views = registries.views ?? viewRegistry
  const seenPaths = new Set<string>()

  function registerNodes(
    items: NavigationMenu[],
    inheritedLayout = '',
    parentPath = '',
    ancestorNames: string[] = [],
  ): void {
    for (const node of items) {
      const selectedLayout = node.layout || inheritedLayout
      const resolvedPath = resolveMenuPath(node.path, parentPath)
      if (node.type === 'directory') {
        registerNodes(node.children, selectedLayout, resolvedPath, [...ancestorNames, node.name])
        continue
      }
      if (node.type !== 'menu' || !resolvedPath || seenPaths.has(resolvedPath)) continue

      const componentInfo = views[node.component]
      const layout = layouts[selectedLayout || DEFAULT_LAYOUT]
      if (!componentInfo || !layout) continue

      seenPaths.add(resolvedPath)
      const route: RouteRecordRaw = {
        path: childPath(resolvedPath),
        name: `menu-layout-${node.id}`,
        component: layout,
        children: [
          {
            path: '',
            name: `menu-${node.id}`,
            component: componentInfo.component,
            meta: {
              title: node.name,
              eyebrow: [...ancestorNames, node.name].join(' / '),
              menuId: node.id,
            },
          },
        ],
      }
      dynamicRouteRemovers.push(targetRouter.addRoute('admin-root', route))
    }
  }

  registerNodes(nodes)
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
    {
      path: '/404',
      name: 'not-found',
      component: notFoundPage,
      meta: { public: true, title: '页面未找到' },
    },
    { path: '/', name: 'admin-root', component: RouterView, children: [] },
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
