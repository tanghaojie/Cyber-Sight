import {
  RouterView,
  type RouteLocationRaw,
  type RouteRecordName,
  type RouteRecordRaw,
  type Router,
} from 'vue-router'
import type { NavigationMenu } from '@scaffold/api-contract'
import { layoutRegistry } from '@/shared/routing/layout-registry'
import { viewRegistry } from '@/shared/routing/view-registry'
import { navigationLabel } from '@/modules/system/navigation/navigation.labels'
import type { LocalizedLabel } from '@/modules/system/localization/localization'

const DYNAMIC_ROUTE_NAME_PREFIX = 'dynamic'

// 守卫通过该标记判断本次会话的菜单路由是否已经安装。
export let routesReady = false

const dynamicRouteRemovers: Array<() => void> = []
let dynamicRootRouteName: RouteRecordName | undefined
let firstDynamicPageRouteName: RouteRecordName | undefined

export function isDynamicRouteName(name: RouteRecordName | null | undefined): name is string {
  return typeof name === 'string' && name.startsWith(`${DYNAMIC_ROUTE_NAME_PREFIX}-`)
}

export function dynamicLandingRoute(): RouteLocationRaw | undefined {
  const name = dynamicRootRouteName ?? firstDynamicPageRouteName
  return name ? { name } : undefined
}

function normalizePath(path: string): string {
  // 清理重复斜杠，同时保留相对路径和绝对路径的区别。
  if (!path.includes('/')) {
    return path
  }
  const segments = path.split('/').filter(Boolean)
  return segments.length ? `${path.startsWith('/') ? '/' : ''}${segments.join('/')}` : ''
}

export function installMenuRoutes(targetRouter: Router, nodes: NavigationMenu[]): number {
  // 每次以服务端最新菜单完整替换旧路由，避免刷新权限后残留不可见页面。
  clearDynamicRoutes()
  const layouts = layoutRegistry
  const views = viewRegistry

  function generateMenuRoute(
    path: string,
    item: NavigationMenu,
    menuPath: LocalizedLabel[],
  ): RouteRecordRaw | undefined {
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

    if (path === '/' && dynamicRootRouteName) {
      console.error(`Ignored duplicate dynamic root page for menu item ${item.id}`)
      return
    }

    const pageRouteName = `${DYNAMIC_ROUTE_NAME_PREFIX}-menu-${compName}-${item.id}`
    firstDynamicPageRouteName ??= pageRouteName
    if (path === '/') {
      dynamicRootRouteName = pageRouteName
    }

    const pageMeta = {
      title: item.name,
      menuPath: menuPath.map((label) => label.fallback).join(' / '),
      localizedTitle: navigationLabel(item),
      localizedMenuPath: menuPath,
      menuId: item.id,
      dynamicPage: true,
      rootEntry: path === '/',
    }

    if (layoutInfo) {
      // 带布局的页面使用空路径子路由承载页面组件，布局只负责外壳和 RouterView。
      const route: RouteRecordRaw = {
        path: path,
        name: `${DYNAMIC_ROUTE_NAME_PREFIX}-menu-layout-${layoutName}-${item.id}`,
        component: layoutInfo.component,
        children: [
          {
            path: '', // 只能有一个空路径子路由，确保访问父路径时直接渲染目标页面。
            name: pageRouteName,
            component: componentInfo.component,
            meta: pageMeta,
          },
        ],
      }
      return route
    } else {
      const route: RouteRecordRaw = {
        path: path,
        name: pageRouteName,
        component: componentInfo.component,
        meta: pageMeta,
      }
      return route
    }
  }

  function generateDirectoryRoute(
    path: string,
    item: NavigationMenu,
    menuPath: LocalizedLabel[],
  ): RouteRecordRaw | undefined {
    const layoutName = item.layout
    const layoutInfo = layoutName ? layouts?.[layoutName] : undefined

    const childrenRoute = (item.children ?? [])
      .map((child) => {
        return generateRoute(child, menuPath)
      })
      .filter(Boolean) as RouteRecordRaw[]

    const route: RouteRecordRaw = {
      path: path,
      name: `${DYNAMIC_ROUTE_NAME_PREFIX}-directory-layout-${layoutName ?? 'RouterView'}-${item.id}`,
      component: layoutInfo ? layoutInfo.component : RouterView,
      // 目录没有页面组件时使用 RouterView 透传其子菜单。
      children: childrenRoute,
    }
    return route
  }

  function generateRoute(
    item: NavigationMenu,
    ancestorNames: LocalizedLabel[] = [],
  ): RouteRecordRaw | undefined {
    if (item.type == 'button') {
      // 外链按钮由侧栏渲染为 <a>，不注册进 Vue Router。
      return
    }

    const path = normalizePath(item.path)
    if (!path) {
      return
    }

    const menuPath = [...ancestorNames, navigationLabel(item)]
    if (item.type === 'directory') {
      return generateDirectoryRoute(path, item, menuPath)
    } else if (item.type === 'menu') {
      return generateMenuRoute(path, item, menuPath)
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
      // addRoute 返回对应卸载函数，退出登录或菜单刷新时统一调用。
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
  dynamicRootRouteName = undefined
  firstDynamicPageRouteName = undefined
  routesReady = false
}
