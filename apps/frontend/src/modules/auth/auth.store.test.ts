import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './auth.store.js'

const api = vi.hoisted(() => ({ POST: vi.fn(), GET: vi.fn() }))
vi.mock('../../api/client.js', () => ({ apiClient: api }))

describe('authentication store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.POST.mockReset()
    api.GET.mockReset()
  })

  it('stores and explicitly clears the current user', async () => {
    api.POST.mockResolvedValue({ data: { status: 0, data: { id: 1, username: 'admin', displayName: '系统管理员', roles: ['SUPER_ADMIN'] } } })
    const auth = useAuthStore()
    await expect(auth.login('admin', 'Admin@123456')).resolves.toBeNull()
    expect(auth.isAuthenticated).toBe(true)
    auth.clearSession()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })
})
