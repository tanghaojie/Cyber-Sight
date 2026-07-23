import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AppSidebar from './AppSidebar.vue'
import { navigationGroups } from '../../router/navigation.js'

describe('AppSidebar', () => {
  it('renders every navigation item and emits after navigation', async () => {
    const wrapper = mount(AppSidebar, {
      props: {
        groups: navigationGroups,
        open: true,
      },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :data-to="to" @click="$emit(\'click\')"><slot /></a>',
          },
        },
      },
    })

    expect(wrapper.text()).toContain('工作台')
    expect(wrapper.text()).toContain('用户管理')
    expect(wrapper.find('[data-to="/dictionaries"]').exists()).toBe(true)

    await wrapper.find('[data-to="/users"]').trigger('click')
    expect(wrapper.emitted('navigate')?.length).toBeGreaterThan(0)
  })

  it('emits close from the mobile close button', async () => {
    const wrapper = mount(AppSidebar, {
      props: {
        groups: navigationGroups,
        open: true,
      },
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    })

    await wrapper.get('[aria-label="关闭菜单"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
