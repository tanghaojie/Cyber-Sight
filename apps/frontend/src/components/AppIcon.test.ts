import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AppIcon from './AppIcon.vue'

vi.mock('virtual:svg-icons-names', function mockIconNames() {
  return { default: ['icon-alert', 'icon-home'] }
})

describe('AppIcon', () => {
  it('renders the generated SVG sprite symbol', () => {
    const wrapper = mount(AppIcon, { props: { name: 'home' } })

    expect(wrapper.get('use').attributes('href')).toBe('#icon-home')
  })

  it('falls back to the alert symbol for an unknown icon', () => {
    const wrapper = mount(AppIcon, { props: { name: 'missing-icon' } })

    expect(wrapper.get('use').attributes('href')).toBe('#icon-alert')
  })
})
