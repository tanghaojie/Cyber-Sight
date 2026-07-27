import type { RouteComponent } from 'vue-router'

export interface ViewRegistrar {
  register(name: string, component: RouteComponent): void
}

export interface ViewRegistrationModule {
  registerViews(registrar: ViewRegistrar): void
}
