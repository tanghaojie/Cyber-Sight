import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { NavigationMenu } from '@scaffold/api-contract'
import AppSidebar from './AppSidebar.vue'

vi.mock('@/modules/health/composables/useHealth.js', () => ({
  useHealth() {
    return { status: 'ok', timestamp: '2026-07-28T00:00:00.000Z', error: null }
  },
}))

const items: NavigationMenu[] = [
  {
    id: 1,
    parentId: 0,
    name: '组织与权限',
    code: 'ORGANIZATION',
    icon: 'layers',
    sortOrder: 10,
    type: 'directory',
    path: '',
    component: '',
    layout: 'AdminLayout',
    externalUrl: '',
    children: [
      {
        id: 2,
        parentId: 1,
        name: '用户管理',
        code: 'USERS',
        icon: 'users',
        sortOrder: 10,
        type: 'menu',
        path: '/users',
        component: 'users',
        layout: '',
        externalUrl: '',
        children: [],
      },
      {
        id: 3,
        parentId: 1,
        name: '产品文档',
        code: 'DOCS',
        icon: 'external',
        sortOrder: 20,
        type: 'button',
        path: '',
        component: '',
        layout: '',
        externalUrl: 'https://example.com',
        children: [],
      },
    ],
  },
]

describe('AppSidebar', () => {
  it('renders directory, internal menu and safe external button', async () => {
    const wrapper = mount(AppSidebar, {
      props: { items, open: true },
      global: {
        stubs: {
          RouterLink: {
            props: ['to'],
            template: '<a :data-to="to" @click="$emit(\'click\')"><slot /></a>',
          },
        },
      },
    })
    expect(wrapper.classes()).toContain('app-sidebar--open')
    expect(wrapper.text()).toContain('组织与权限')
    expect(wrapper.find('[data-to="/users"]').exists()).toBe(true)
    expect(wrapper.get('a[href="https://example.com"]').attributes('rel')).toBe(
      'noopener noreferrer',
    )
    await wrapper.get('[data-to="/users"]').trigger('click')
    expect(wrapper.emitted('navigate')?.length).toBeGreaterThan(0)
  })

  it('collapses a directory and emits close on mobile', async () => {
    const wrapper = mount(AppSidebar, {
      props: { items, open: true },
      global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
    })
    await wrapper.get('.sidebar-directory').trigger('click')
    expect(wrapper.text()).not.toContain('用户管理')
    await wrapper.get('[aria-label="关闭菜单"]').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })
})
