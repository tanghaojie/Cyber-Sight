import { RouterView, type RouteRecordRaw, type Router } from 'vue-router'
import type { NavigationMenu } from '@scaffold/api-contract'
import { layoutRegistry } from '@/shared/routing/layout-registry'
import { viewRegistry } from '@/shared/routing/view-registry'

const DYNAMIC_ROUTE_NAME_PREFIX = 'dynamic'

export let routesReady = false

const dynamicRouteRemovers: Array<() => void> = []

function normalizePath(path: string): string {
  if (!path.includes('/')) {
    return path
  }
  const segments = path.split('/').filter(Boolean)
  return segments.length ? `${path.startsWith('/') ? '/' : ''}${segments.join('/')}` : ''
}

export function installMenuRoutes(targetRouter: Router, nodes: NavigationMenu[]): number {
  clearDynamicRoutes()
  const layouts = layoutRegistry
  const views = viewRegistry

  function generateMenuRoute(path: string, item: NavigationMenu): RouteRecordRaw | undefined {
    const compName = item.component
    const layoutName = item.layout
    if (!compName) {
      console.error(`Could not find component name for menu item ${item.id}`)
      return
    }

    const componentInfo = views?.[compName]
    const layoutInfo = layoutName ? layouts?.[layoutName] : undefined
    if (!componentInfo) {
      console.error(`Could not find component ${compName} for menu item ${item.id}`)
      return
    }

    if (layoutInfo) {
      const route: RouteRecordRaw = {
        path: path,
        name: `${DYNAMIC_ROUTE_NAME_PREFIX}-menu-layout-${layoutName}-${item.id}`,
        component: layoutInfo.component,
        children: [
          {
            path: '', // 有且只能有一个 children，且 path = ''
            name: `${DYNAMIC_ROUTE_NAME_PREFIX}-menu-${compName}-${item.id}`,
            component: componentInfo.component,
            meta: {
              title: item.name,
              eyebrow: ['准备删除'].join(' / '),
              menuId: item.id,
            },
          },
        ],
      }
      return route
    } else {
      const route: RouteRecordRaw = {
        path: path,
        name: `${DYNAMIC_ROUTE_NAME_PREFIX}-menu-${compName}-${item.id}`,
        component: componentInfo.component,
        meta: {
          title: item.name,
          eyebrow: ['准备删除'].join(' / '),
          menuId: item.id,
        },
      }
      return route
    }
  }

  function generateDirectoryRoute(path: string, item: NavigationMenu): RouteRecordRaw | undefined {
    const layoutName = item.layout
    const layoutInfo = layoutName ? layouts?.[layoutName] : undefined

    const childrenRoute = (item.children ?? [])
      .map((child) => {
        return generateRoute(child)
      })
      .filter(Boolean) as RouteRecordRaw[]

    const route: RouteRecordRaw = {
      path: path,
      name: `${DYNAMIC_ROUTE_NAME_PREFIX}-directory-layout-${layoutName ?? 'RouterView'}-${item.id}`,
      component: layoutInfo ? layoutInfo.component : RouterView,
      children: childrenRoute,
    }
    return route
  }

  function generateRoute(item: NavigationMenu): RouteRecordRaw | undefined {
    if (item.type == 'button') {
      return
    }

    const path = normalizePath(item.path)
    if (!path) {
      return
    }

    if (item.type === 'directory') {
      return generateDirectoryRoute(path, item)
    } else if (item.type === 'menu') {
      return generateMenuRoute(path, item)
    } else {
      throw new Error(`Unrecognized menu item type: ${item.type}`)
    }
  }

  function registerNodesTree(items: NavigationMenu[]): void {
    for (const item of items) {
      const route = generateRoute(item)
      if (!route) {
        continue
      }
      dynamicRouteRemovers.push(targetRouter.addRoute(route))
    }
  }

  registerNodesTree(nodes)
  routesReady = true
  return dynamicRouteRemovers.length
}

export function clearDynamicRoutes(): void {
  for (const remove of dynamicRouteRemovers.splice(0)) {
    remove()
  }
  routesReady = false
}
