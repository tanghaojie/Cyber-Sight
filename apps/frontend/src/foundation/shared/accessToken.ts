import cookies from 'js-cookie'
import { browserStorage } from './browserStorage'
import { platformStorageKey } from '@/foundation/platform/platform'

const USE_COOKIES = true
const LEGACY_ACCESS_TOKEN_KEYS = ['cyber_access_token', 'jtlib_access_token'] as const

function accessTokenKey(): string {
  return platformStorageKey('access_token')
}

export function getAccessToken(): string | undefined {
  try {
    const token = USE_COOKIES
      ? cookies.get(accessTokenKey())
      : (browserStorage()?.getItem(accessTokenKey()) ?? undefined)
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
      ? cookies.set(accessTokenKey(), token, { expires: expiresAt })
      : browserStorage()?.setItem(accessTokenKey(), token)
  } catch {
    // 受限浏览器上下文可能禁用 Cookie 或 Storage，此时让后续鉴权自然失败。
  }
}

export function clearAccessToken(): void {
  try {
    cookies.remove(accessTokenKey())
    browserStorage()?.removeItem(accessTokenKey())
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
