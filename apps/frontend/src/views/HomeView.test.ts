import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import HomeView from './HomeView.vue'

const mockedUseHealth = vi.hoisted(() => vi.fn())

vi.mock('../modules/health/composables/useHealth.js', () => ({
  useHealth: mockedUseHealth,
}))

describe('HomeView', () => {
  beforeEach(() => {
    mockedUseHealth.mockReset()
  })

  it('renders the loading state', () => {
    mockedUseHealth.mockReturnValue({
      status: ref('loading...'),
      timestamp: ref(''),
      error: ref(null),
      fetchHealth: vi.fn(),
    })

    const wrapper = mount(HomeView)

    expect(wrapper.text()).toContain('Backend status: loading...')
    expect(wrapper.text()).not.toContain('Last checked:')
  })

  it('renders a successful health check', () => {
    mockedUseHealth.mockReturnValue({
      status: ref('ok'),
      timestamp: ref('2026-07-22T08:00:00.000Z'),
      error: ref(null),
      fetchHealth: vi.fn(),
    })

    const wrapper = mount(HomeView)

    expect(wrapper.text()).toContain('Backend status: ok')
    expect(wrapper.text()).toContain('Last checked: 2026-07-22T08:00:00.000Z')
  })

  it('renders an error returned by the health composable', () => {
    mockedUseHealth.mockReturnValue({
      status: ref('error'),
      timestamp: ref(''),
      error: ref('Failed to reach backend'),
      fetchHealth: vi.fn(),
    })

    const wrapper = mount(HomeView)

    expect(wrapper.text()).toContain('Backend status: error')
    expect(wrapper.text()).toContain('Failed to reach backend')
  })

  it('refreshes the health status when the button is clicked', async () => {
    const fetchHealth = vi.fn()
    mockedUseHealth.mockReturnValue({
      status: ref('ok'),
      timestamp: ref(''),
      error: ref(null),
      fetchHealth,
    })

    const wrapper = mount(HomeView)
    await wrapper.get('button').trigger('click')

    expect(fetchHealth).toHaveBeenCalledOnce()
  })
})
