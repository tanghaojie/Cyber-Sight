import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeView from './HomeView.vue'

describe('HomeView', () => {
  it('keeps the management home page intentionally blank', () => {
    const wrapper = mount(HomeView)

    expect(wrapper.find('[aria-label="空白首页"]').exists()).toBe(true)
    expect(wrapper.text()).toBe('')
  })
})
