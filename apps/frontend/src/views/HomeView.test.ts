import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import HomeView from './HomeView.vue'

describe('HomeView', () => {
  it('renders module shortcuts and the dynamic loading explanation', () => {
    const wrapper = mount(HomeView, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
          ElTag: { template: '<span><slot /></span>' },
        },
      },
    })

    expect(wrapper.find('[aria-label="工作台总览"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('用户管理')
    expect(wrapper.text()).toContain('路由懒加载页面组件')
  })
})
