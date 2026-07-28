import type { RouteComponent } from 'vue-router'

export interface ViewRegistrar {
  register(key: string, label: string, component: RouteComponent): void
}

export interface ViewRegistrationModule {
  registerViews(registrar: ViewRegistrar): void
}
