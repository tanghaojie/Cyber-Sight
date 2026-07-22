import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAuthStore } from './auth.js'

const api = vi.hoisted(() => ({ POST: vi.fn(), GET: vi.fn() }))
vi.mock('../api/client.js', () => ({ apiClient: api }))

describe('authentication store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    api.POST.mockReset()
    api.GET.mockReset()
  })

  it('stores the current user after a successful login', async () => {
    api.POST.mockResolvedValue({
      data: {
        status: 0,
        data: { id: 1, username: 'admin', displayName: '系统管理员', roles: ['SUPER_ADMIN'] },
      },
    })
    const auth = useAuthStore()

    await expect(auth.login('admin', 'Admin@123456')).resolves.toBeNull()
    expect(auth.user?.username).toBe('admin')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('keeps the session empty when credentials are rejected', async () => {
    api.POST.mockResolvedValue({ data: { status: 2000, err: 'Incorrect username or password' } })
    const auth = useAuthStore()

    await expect(auth.login('admin', 'wrong-password')).resolves.toBe('Incorrect username or password')
    expect(auth.user).toBeNull()
  })
})
