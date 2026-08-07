import type { RouteLocationRaw, Router } from 'vue-router'
import { dynamicLandingRoute, isDynamicRouteName } from './dynamicRoutes'

/**
 * 解析已认证用户访问根路径时的实际落点。静态根页面必须显式声明 rootEntry，
 * 默认配置不占用 `/`，因此动态菜单可以把任一已登记页面设为根页面。
 */
export function resolveRootEntry(router: Router): RouteLocationRaw {
  const staticRoot = router
    .getRoutes()
    .find(
      (route) =>
        route.path === '/' && route.meta.rootEntry === true && !isDynamicRouteName(route.name),
    )

  if (staticRoot?.name) {
    return { name: staticRoot.name }
  }

  return dynamicLandingRoute() ?? { name: 'no-access' }
}
