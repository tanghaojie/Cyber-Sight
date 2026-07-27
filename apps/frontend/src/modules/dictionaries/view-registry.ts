import type { ViewRegistrar } from '../../shared/routing/view-registry.js'
import { dictionariesPage } from './index.js'

export function registerViews(appViews: ViewRegistrar): void {
  appViews.register('dictionaries', dictionariesPage)
}
