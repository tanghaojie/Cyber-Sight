import {
  type RouteComponent,
  type RouteLocationNormalized,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'
import type { NavigationMenu } from '@scaffold/api-contract'
import { pinia } from '@/stores/pinia.js'
import { useAuthStore } from '@/modules/auth/auth.store.js'
import { useNavigationStore } from '@/modules/navigation/navigation.store.js'
import { resolveMenuPath } from '@/shared/routing/menu-paths.js'
import { DEFAULT_LAYOUT, layoutRegistry } from '@/shared/routing/layout-registry.js'
import { viewRegistry } from './view-registry.js'

const dynamicRouteRemovers: Array<() => void> = []
let routesReady = false

function childPath(path: string): string {
  return path === '/' ? '' : path.replace(/^\/+/, '')
}

interface RouteRegistries {
  layouts?: Readonly<
    Record<
      string,
      {
        label: string
        component: RouteComponent
      }
    >
  >
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
    for (const item of items) {
      const selectedLayout = item.layout || inheritedLayout
      const resolvedPath = resolveMenuPath(item.path, parentPath)
      if (item.type === 'directory') {
        registerNodes(item.children, selectedLayout, resolvedPath, [...ancestorNames, item.name])
        continue
      }
      if (item.type !== 'menu' || !resolvedPath || seenPaths.has(resolvedPath)) {
        continue
      }

      const componentInfo = views[item.component]
      const layout = layouts[selectedLayout || DEFAULT_LAYOUT]
      if (!componentInfo || !layout) {
        continue
      }

      seenPaths.add(resolvedPath)
      const route: RouteRecordRaw = {
        path: childPath(resolvedPath),
        name: `menu-layout-${item.id}`,
        component: layout.component,
        children: [
          {
            path: '',
            name: `menu-${item.id}`,
            component: componentInfo.component,
            meta: {
              title: item.name,
              eyebrow: [...ancestorNames, item.name].join(' / '),
              menuId: item.id,
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
  if (to.name === 'dynamic-fallback') {
    return { name: 'not-found', query: { from: to.fullPath } }
  }
  return true
}
