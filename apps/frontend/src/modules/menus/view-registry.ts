import type { ViewRegistrar } from '../../shared/routing/view-registry.js'
import { menusPage } from './index.js'

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('menus', menusPage)
}
