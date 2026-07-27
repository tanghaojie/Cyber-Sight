import type { ViewRegistrar } from '../../shared/routing/view-registry.js'
import { rolesPage } from './index.js'

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('roles', rolesPage)
}
