import type { RouteComponent } from 'vue-router'

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
  const layouts: Record<string, { label: string; component: RouteComponent }> = Object.create(null)

  for (const [modulePath, component] of Object.entries(modules).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    const name = layoutName(modulePath)
    if (!name) {
      throw new Error(`Invalid layout file "${modulePath}"`)
    }
    if (Object.hasOwn(layouts, name)) {
      throw new Error(`Duplicate layout name "${name}"`)
    }
    layouts[name] = {
      label: name,
      component,
    }
  }

  if (!Object.hasOwn(layouts, DEFAULT_LAYOUT)) {
    throw new Error(`Default layout "${DEFAULT_LAYOUT}" was not found`)
  }

  return Object.freeze(layouts)
}

export const layoutRegistry = createLayoutRegistry(layoutModules)
