import type { RouteComponent } from 'vue-router'
import { describe, expect, it } from 'vitest'
import type { ViewRegistrar } from '../shared/routing/view-registry.js'
import { createViewRegistry, viewRegistry } from './view-registry.js'

const testComponent: RouteComponent = () => Promise.resolve({})

describe('view registry', () => {
  it('automatically discovers the built-in module registrations', () => {
    expect(Object.keys(viewRegistry).sort()).toEqual([
      'dictionaries',
      'home',
      'menus',
      'roles',
      'users',
    ])
    expect(Object.isFrozen(viewRegistry)).toBe(true)
  })

  it('rejects duplicate view names instead of silently overriding them', () => {
    expect(() => createViewRegistry({
      './alpha/view-registry.ts': {
        registerViews(registrar: ViewRegistrar) {
          registrar.register('shared-view', testComponent)
        },
      },
      './beta/view-registry.ts': {
        registerViews(registrar: ViewRegistrar) {
          registrar.register('shared-view', testComponent)
        },
      },
    })).toThrow('Duplicate view name "shared-view"')
  })

  it('rejects files that do not export the registration function', () => {
    expect(() => createViewRegistry({
      './invalid/view-registry.ts': {},
    })).toThrow('must export registerViews()')
  })

  it('rejects unstable view names', () => {
    expect(() => createViewRegistry({
      './invalid-name/view-registry.ts': {
        registerViews(registrar: ViewRegistrar) {
          registrar.register('../private-page', testComponent)
        },
      },
    })).toThrow('Invalid view name "../private-page"')
  })
})
