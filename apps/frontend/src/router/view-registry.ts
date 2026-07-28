import { createViewRegistry, type ViewRegistrationModule } from '@/shared/routing/view-registry.js'

const viewRegistrationModules = import.meta.glob<ViewRegistrationModule>(
  '@/modules/**/view-registry.ts',
  { eager: true },
)

export const viewRegistry = createViewRegistry(viewRegistrationModules)
