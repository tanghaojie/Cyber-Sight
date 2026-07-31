import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { CurrentUser } from '@scaffold/api-contract'
import { clearAccessToken, getAccessToken, setAccessToken } from '@/shared/accessToken'
import { login as apiLogin, getCurrentUser, logout as apiLogout } from './auth.api'
import { translate } from '@/modules/system/localization/localization'

/** 维护当前会话用户、令牌恢复状态和登录提交状态。 */
export const useAuthStore = defineStore('auth', () => {
  const user = ref<CurrentUser | null>(null)
  const checked = ref(false)
  const busy = ref(false)
  const isAuthenticated = computed(() => user.value !== null)

  async function login(username: string, password: string): Promise<string | null> {
    busy.value = true
    try {
      const response = await apiLogin(username, password)
      if (response.status === 0 && response.data) {
        // 先保存身份和令牌，再标记检查完成，路由守卫可立即放行目标页面。
        user.value = response.data.user
        setAccessToken(response.data.issued.token, new Date(response.data.issued.expiresAt))
        checked.value = true
        return null
      }

      return response.status === 2000
        ? translate('auth.errors.invalidCredentials')
        : translate('auth.errors.loginFailed')
    } catch {
      return translate('auth.errors.connectionFailed')
    } finally {
      busy.value = false
    }
  }

  async function fetchCurrentUser(): Promise<void> {
    // checked 防止每次路由切换重复请求；刷新页面时仅恢复一次持久会话。
    if (checked.value) {
      return
    }
    if (!getAccessToken()) {
      // 没有本地令牌即可确认未登录，无需发送必然返回 401 的请求。
      checked.value = true
      return
    }
    try {
      const res = await getCurrentUser()
      if (res.status === 0 && res.data) {
        user.value = res.data
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
      await apiLogout()
    } finally {
      // 即使后端暂时不可用，也必须清除本地令牌，保证用户能够退出当前客户端。
      clearSession()
    }
  }

  return { user, checked, busy, isAuthenticated, login, logout, fetchCurrentUser, clearSession }
})
