import type { RouteComponent } from 'vue-router'
import type { ViewRegistrationModule } from '../shared/routing/view-registry.js'

const viewRegistrationModules = import.meta.glob<ViewRegistrationModule>(
  '../modules/**/view-registry.ts',
  { eager: true },
)

function isViewRegistrationModule(value: unknown): value is ViewRegistrationModule {
  return typeof value === 'object'
    && value !== null
    && 'registerViews' in value
    && typeof value.registerViews === 'function'
}

export function createViewRegistry(
  modules: Readonly<Record<string, unknown>>,
): Readonly<Record<string, RouteComponent>> {
  const registeredViews: Record<string, RouteComponent> = Object.create(null)

  for (const [modulePath, registrationModule] of Object.entries(modules).sort(([left], [right]) => left.localeCompare(right))) {
    if (!isViewRegistrationModule(registrationModule)) {
      throw new Error(`View registry module "${modulePath}" must export registerViews()`)
    }

    registrationModule.registerViews({
      register(name, component) {
        if (!/^[a-z][a-z0-9-]*$/.test(name)) {
          throw new Error(`Invalid view name "${name}" registered by "${modulePath}"`)
        }
        if (Object.hasOwn(registeredViews, name)) {
          throw new Error(`Duplicate view name "${name}" registered by "${modulePath}"`)
        }
        registeredViews[name] = component
      },
    })
  }

  return Object.freeze(registeredViews)
}

export const viewRegistry = createViewRegistry(viewRegistrationModules)
