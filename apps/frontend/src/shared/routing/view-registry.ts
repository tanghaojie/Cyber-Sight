import type { RouteComponent } from 'vue-router'
import {
  DUPLICATE_VIEW_KEY,
  INVALID_VIEW_KEY,
  REGISTER_VIEWS_MODULE_NOT_EXPORT_REGISTER_VIEWS,
} from '../errMsg'

export interface ViewRegistrar {
  register(key: string, label: string, component: RouteComponent): void
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

export function createViewRegistry(
  modules: Readonly<Record<string, unknown>>,
): Readonly<Record<string, { label: string; component: RouteComponent }>> {
  const registeredViews: Record<string, { label: string; component: RouteComponent }> =
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
  '@/modules/**/registerViews.ts',
  { eager: true },
)

export const viewRegistry = createViewRegistry(viewRegistrationModules)
