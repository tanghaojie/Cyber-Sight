import cookies from 'js-cookie'

const USE_COOKIES = true
const ACCESS_TOKEN_KEY = 'cyber_access_token'
const LEGACY_ACCESS_TOKEN_KEYS = ['jtlib_access_token'] as const

// 集中封装浏览器持久化，受限上下文或 SSR 中不可用时安全降级为无会话。
function browserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.localStorage
  } catch {
    return null
  }
}

export function getAccessToken(): string | undefined {
  try {
    const token = USE_COOKIES
      ? cookies.get(ACCESS_TOKEN_KEY)
      : (browserStorage()?.getItem(ACCESS_TOKEN_KEY) ?? undefined)
    if (!token) {
      clearLegacyAccessTokens()
    }
    return token
  } catch {
    return undefined
  }
}

export function setAccessToken(token: string, expiresAt: Date): void {
  try {
    clearLegacyAccessTokens()
    // 当前默认使用有过期时间的 Cookie；保留 localStorage 分支便于部署策略切换。
    USE_COOKIES
      ? cookies.set(ACCESS_TOKEN_KEY, token, { expires: expiresAt })
      : browserStorage()?.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // 受限浏览器上下文可能禁用 Cookie 或 Storage，此时让后续鉴权自然失败。
  }
}

export function clearAccessToken(): void {
  try {
    cookies.remove(ACCESS_TOKEN_KEY)
    browserStorage()?.removeItem(ACCESS_TOKEN_KEY)
    clearLegacyAccessTokens()
  } catch {
    // 存储本就不可用时已等价于清除成功，无需继续抛错。
  }
}

function clearLegacyAccessTokens(): void {
  for (const key of LEGACY_ACCESS_TOKEN_KEYS) {
    cookies.remove(key)
    browserStorage()?.removeItem(key)
  }
}
