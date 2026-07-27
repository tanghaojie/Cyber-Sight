import { shallowMount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
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

vi.mock('../modules/auth/index.js', () => ({
  useAuthStore: () => ({
    user: { displayName: '系统管理员', roles: ['SUPER_ADMIN'] },
    logout: mocks.logout,
  }),
}))

vi.mock('../modules/navigation/index.js', () => ({
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
  it('opens AppSidebar on the first render', () => {
    const wrapper = shallowMount(AdminLayout)

    expect(wrapper.findComponent(AppSidebar).props('open')).toBe(true)
  })
})
