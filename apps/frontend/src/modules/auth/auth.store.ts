import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type {
  CurrentUser,
  CurrentUserResponse,
  EmptySuccessResponse,
  LoginRequest,
  LoginSuccessResponse,
} from '@scaffold/api-contract'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/shared/accessToken'
import { apiClient } from '@/api/client'

function responseError(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null && 'err' in data && typeof data.err === 'string') {
    return data.err
  }
  return fallback
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const checked = ref(false)
  const busy = ref(false)
  const isAuthenticated = computed(() => user.value !== null)

  async function login(username: string, password: string): Promise<string | null> {
    busy.value = true
    try {
      const { data, error } = await apiClient.POST<LoginSuccessResponse, LoginRequest>(
        '/auth/login',
        { body: { username, password } },
      )
      const response = data ?? error
      if (response && response.status === 0 && 'data' in response && response.data) {
        user.value = response.data.user
        setAccessToken(response.data.issued.token, new Date(response.data.issued.expiresAt))
        checked.value = true
        return null
      }
      return responseError(response, '登录失败，请稍后重试')
    } catch {
      return '无法连接到服务，请检查后端是否已启动'
    } finally {
      busy.value = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    if (checked.value) {
      return
    }
    if (!getAccessToken()) {
      checked.value = true
      return
    }
    try {
      const { data } = await apiClient.GET<CurrentUserResponse>('/auth/me')
      if (data?.status === 0 && data.data) {
        user.value = data.data
      }
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  function clearSession(): void {
    clearAccessToken()
    user.value = null
    checked.value = true
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.POST<EmptySuccessResponse>('/auth/logout')
    } finally {
      clearSession()
    }
  }

  return { user, checked, busy, isAuthenticated, login, logout, fetchCurrentUser, clearSession }
})
