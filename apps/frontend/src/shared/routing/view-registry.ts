import type { RouteComponent } from 'vue-router'

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
      throw new Error(`View registry module "${modulePath}" must export registerViews()`)
    }

    registrationModule.registerViews({
      register(key, label, component) {
        if (!/^[a-z][a-z0-9-]*$/.test(key)) {
          throw new Error(`Invalid view key "${key}" registered by "${modulePath}"`)
        }
        if (Object.hasOwn(registeredViews, key)) {
          throw new Error(`Duplicate view key "${key}" registered by "${modulePath}"`)
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
  '@/modules/**/view-registry.ts',
  { eager: true },
)

export const viewRegistry = createViewRegistry(viewRegistrationModules)
