import type { RouteComponent } from 'vue-router'
import { describe, expect, it } from 'vitest'
import {
  createLayoutRegistry,
  layoutOptions,
  layoutRegistry,
} from './layout-registry.js'

const testComponent: RouteComponent = () => Promise.resolve({})

describe('layout registry', () => {
  it('automatically discovers every top-level Vue layout', () => {
    expect(Object.keys(layoutRegistry)).toEqual(['AdminLayout'])
    expect(layoutOptions).toEqual([{ value: 'AdminLayout', label: 'AdminLayout' }])
    expect(Object.isFrozen(layoutRegistry)).toBe(true)
  })

  it('uses Vue file names as stable layout identifiers', () => {
    const registry = createLayoutRegistry({
      '../../layouts/AdminLayout.vue': testComponent,
      '../../layouts/PlainLayout.vue': testComponent,
    })

    expect(Object.keys(registry)).toEqual(['AdminLayout', 'PlainLayout'])
  })

  it('requires the default layout to exist', () => {
    expect(() =>
      createLayoutRegistry({ '../../layouts/PlainLayout.vue': testComponent }),
    ).toThrow('Default layout "AdminLayout" was not found')
  })
})
