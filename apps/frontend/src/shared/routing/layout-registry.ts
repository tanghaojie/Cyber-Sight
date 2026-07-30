import type { RouteComponent } from 'vue-router'
import { DEFAULT_LAYOUT_NOT_FOUND, DUPLICATE_LAYOUT_NAME, INVALID_LAYOUT_FILE } from '../errMsg'

export const DEFAULT_LAYOUT = 'AdminLayout'

const layoutModules = import.meta.glob<RouteComponent>('@/layouts/*.vue', {
  import: 'default',
})

function layoutName(modulePath: string): string {
  const fileName = modulePath.split('/').at(-1) ?? ''
  return fileName.replace(/\.vue$/, '')
}

export function createLayoutRegistry(
  modules: Readonly<Record<string, RouteComponent>>,
): Readonly<Record<string, { label: string; component: RouteComponent }>> {
  // 布局文件名就是后端菜单保存的稳定 layout 键。
  const layouts: Record<string, { label: string; component: RouteComponent }> = Object.create(null)

  for (const [modulePath, component] of Object.entries(modules).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const name = layoutName(modulePath)
    if (!name) {
      throw new Error(`${INVALID_LAYOUT_FILE} "${modulePath}"`)
    }
    if (Object.hasOwn(layouts, name)) {
      throw new Error(`${DUPLICATE_LAYOUT_NAME} "${name}"`)
    }
    layouts[name] = {
      label: name,
      component,
    }
  }

  if (!Object.hasOwn(layouts, DEFAULT_LAYOUT)) {
    // 默认布局缺失会使普通菜单无法生成路由，因此在启动时直接失败。
    throw new Error(`${DEFAULT_LAYOUT_NOT_FOUND} "${DEFAULT_LAYOUT}"`)
  }

  return Object.freeze(layouts)
}

export const layoutRegistry = createLayoutRegistry(layoutModules)
