import type { ViewRegistrar } from '../../shared/routing/view-registry.js'
import { homePage } from './index.js'

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('home', homePage)
}
