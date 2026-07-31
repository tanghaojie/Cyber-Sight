import type { RouteComponent } from 'vue-router'
import {
  DUPLICATE_VIEW_KEY,
  INVALID_VIEW_KEY,
  REGISTER_VIEWS_MODULE_NOT_EXPORT_REGISTER_VIEWS,
} from '../errMsg'

export interface ViewLabel {
  key?: string
  fallback: string
}

export interface ViewRegistrar {
  register(key: string, label: ViewLabel, component: RouteComponent): void
}

export interface ViewRegistrationModule {
  registerViews(registrar: ViewRegistrar): void
}

function isViewRegistrationModule(value: unknown): value is ViewRegistrationModule {
  return (
    typeof value === 'object' &&
    value !== null &&
    'registerViews' in value &&
    typeof value.registerViews === 'function'
  )
}

/** 汇总各业务模块显式登记的页面组件，并在启动时阻止非法或重复的菜单组件键。 */
export function createViewRegistry(
  modules: Readonly<Record<string, unknown>>,
): Readonly<Record<string, { label: ViewLabel; component: RouteComponent }>> {
  const registeredViews: Record<string, { label: ViewLabel; component: RouteComponent }> =
    // 无原型对象避免诸如 toString 的键与 Object 原型属性冲突。
    Object.create(null)

  for (const [modulePath, registrationModule] of Object.entries(modules).sort(([left], [right]) =>
    left.localeCompare(right),
  )) {
    if (!isViewRegistrationModule(registrationModule)) {
      throw new Error(`${REGISTER_VIEWS_MODULE_NOT_EXPORT_REGISTER_VIEWS} "${modulePath}"`)
    }

    registrationModule.registerViews({
      register(key, label, component) {
        if (!/^[a-z][a-z0-9-]*$/.test(key)) {
          throw new Error(`${INVALID_VIEW_KEY} "${key}" registered by "${modulePath}"`)
        }
        if (Object.hasOwn(registeredViews, key)) {
          throw new Error(`${DUPLICATE_VIEW_KEY} "${key}" registered by "${modulePath}"`)
        }
        registeredViews[key] = {
          label,
          component,
        }
      },
    })
  }

  return Object.freeze(registeredViews)
}

const viewRegistrationModules = import.meta.glob<ViewRegistrationModule>(
  // eager 让注册错误在应用启动阶段暴露，而不是首次访问菜单时才失败。
  ['@/modules/system/**/registerViews.ts', '@/modules/biz/**/registerViews.ts'],
  { eager: true },
)

export const viewRegistry = createViewRegistry(viewRegistrationModules)
