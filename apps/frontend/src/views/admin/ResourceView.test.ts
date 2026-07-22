import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import ResourceView from './ResourceView.vue'

const adminApi = vi.hoisted(() => ({
  listResource: vi.fn(),
  createResource: vi.fn(),
  updateResource: vi.fn(),
  deleteResource: vi.fn(),
}))

vi.mock('../../modules/admin/admin.api.js', () => adminApi)

describe('ResourceView', () => {
  beforeEach(() => {
    adminApi.listResource.mockReset()
    adminApi.listResource.mockResolvedValue({
      status: 0,
      list: [{
        id: 1,
        username: 'admin',
        displayName: '系统管理员',
        email: 'admin@example.com',
        roleIds: [1],
        enabled: true,
        isDeleted: false,
        createdAt: '2026-07-22T00:00:00.000Z',
        createdBy: 0,
        updatedAt: '2026-07-22T00:00:00.000Z',
        updatedBy: 0,
      }],
      total: 1,
    })
  })

  it('renders a successful user list and status', async () => {
    const wrapper = mount(ResourceView, { props: { resource: 'users' } })
    await flushPromises()

    expect(wrapper.text()).toContain('系统管理员')
    expect(wrapper.text()).toContain('admin@example.com')
    expect(wrapper.text()).toContain('启用')
  })

  it('renders the empty state', async () => {
    adminApi.listResource.mockResolvedValue({ status: 0, list: [], total: 0 })
    const wrapper = mount(ResourceView, { props: { resource: 'roles' } })
    await flushPromises()

    expect(wrapper.text()).toContain('暂无数据')
    expect(wrapper.text()).toContain('可以点击右上角按钮新增角色')
  })

  it('renders a list failure without stale rows', async () => {
    adminApi.listResource.mockRejectedValue(new Error('服务暂不可用'))
    const wrapper = mount(ResourceView, { props: { resource: 'menus' } })
    await flushPromises()

    expect(wrapper.text()).toContain('服务暂不可用')
    expect(wrapper.findAll('tbody tr')).toHaveLength(1)
  })
})
