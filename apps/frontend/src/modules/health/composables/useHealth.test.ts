import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useHealth } from './useHealth.js'

const mockedGet = vi.hoisted(() => vi.fn())

vi.mock('@/api/client.js', () => ({
  apiClient: {
    GET: mockedGet,
  },
}))

const TestComponent = defineComponent({
  setup() {
    return useHealth()
  },
  template: `
    <div>
      <span data-status>{{ status }}</span>
      <span data-timestamp>{{ timestamp }}</span>
      <span data-error>{{ error }}</span>
    </div>
  `,
})

describe('useHealth', () => {
  beforeEach(() => {
    mockedGet.mockReset()
  })

  it('unwraps a successful business response', async () => {
    mockedGet.mockResolvedValue({
      data: {
        status: 0,
        data: {
          status: 'ok',
          timestamp: '2026-07-22T08:00:00.000Z',
        },
      },
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    expect(wrapper.get('[data-status]').text()).toBe('ok')
    expect(wrapper.get('[data-timestamp]').text()).toBe('2026-07-22T08:00:00.000Z')
    expect(wrapper.get('[data-error]').text()).toBe('')
  })

  it('shows the error from a failed response', async () => {
    mockedGet.mockResolvedValue({
      error: {
        status: 1003,
        err: 'Resource not found',
      },
    })

    const wrapper = mount(TestComponent)
    await flushPromises()

    expect(wrapper.get('[data-status]').text()).toBe('error')
    expect(wrapper.get('[data-timestamp]').text()).toBe('')
    expect(wrapper.get('[data-error]').text()).toBe('Resource not found')
  })
})
