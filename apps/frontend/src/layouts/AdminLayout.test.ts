import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import AppHeader from '../components/layout/AppHeader.vue'
import AppMain from '../components/layout/AppMain.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import AdminLayout from './AdminLayout.vue'

const mocks = vi.hoisted(() => ({
  replace: vi.fn(),
  logout: vi.fn(),
  clearNavigation: vi.fn(),
}))

vi.mock('vue-router', () => ({
  useRoute: () => ({ meta: {} }),
  useRouter: () => ({ replace: mocks.replace }),
}))

vi.mock('../modules/auth/auth.store.js', () => ({
  useAuthStore: () => ({
    user: { displayName: '系统管理员', roles: ['SUPER_ADMIN'] },
    logout: mocks.logout,
  }),
}))

vi.mock('../modules/navigation/navigation.store.js', () => ({
  useNavigationStore: () => ({
    items: [],
    loading: false,
    loaded: true,
    clear: mocks.clearNavigation,
  }),
}))

vi.mock('../router/index.js', () => ({
  installMenuRoutes: vi.fn(),
  clearDynamicRoutes: vi.fn(),
}))

describe('AdminLayout', () => {
  it('renders the shell regions with the mobile drawer closed initially', () => {
    const wrapper = shallowMount(AdminLayout)

    expect(wrapper.classes()).toContain('app-shell')
    expect(wrapper.find('.app-shell__content').exists()).toBe(true)
    expect(wrapper.findComponent(AppSidebar).props('open')).toBe(false)
    expect(wrapper.findComponent(AppHeader).exists()).toBe(true)
    expect(wrapper.findComponent(AppMain).exists()).toBe(true)
  })

  it('opens the mobile drawer from AppHeader and closes it with the scrim', async () => {
    const wrapper = shallowMount(AdminLayout)

    wrapper.findComponent(AppHeader).vm.$emit('open-menu')
    await wrapper.vm.$nextTick()

    expect(wrapper.findComponent(AppSidebar).props('open')).toBe(true)
    expect(wrapper.find('.app-shell__scrim').exists()).toBe(true)

    await wrapper.get('.app-shell__scrim').trigger('click')

    expect(wrapper.findComponent(AppSidebar).props('open')).toBe(false)
    expect(wrapper.find('.app-shell__scrim').exists()).toBe(false)
  })
})
