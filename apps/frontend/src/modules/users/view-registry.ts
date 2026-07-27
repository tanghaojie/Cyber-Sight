import type { ViewRegistrar } from '../../shared/routing/view-registry.js'
import { usersPage } from './index.js'

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('users', usersPage)
}
