import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { components } from '@scaffold/openapi-spec'
import { apiClient } from '../api/client.js'

type CurrentUser = components['schemas']['CurrentUser']

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
      const { data, error } = await apiClient.POST('/auth/login', {
        body: { username, password },
      })
      const response = data ?? error
      if (response && response.status === 0 && 'data' in response && response.data) {
        user.value = response.data
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
    if (checked.value) return
    try {
      const { data } = await apiClient.GET('/auth/me')
      if (data?.status === 0 && data.data) user.value = data.data
    } catch {
      user.value = null
    } finally {
      checked.value = true
    }
  }

  async function logout(): Promise<void> {
    try {
      await apiClient.POST('/auth/logout')
    } finally {
      user.value = null
      checked.value = true
    }
  }

  return { user, checked, busy, isAuthenticated, login, logout, fetchCurrentUser }
})
