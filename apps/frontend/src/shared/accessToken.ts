import cookies from 'js-cookie'

const USE_COOKIES = true
const ACCESS_TOKEN_KEY = 'jtlib_access_token'

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
    return USE_COOKIES
      ? cookies.get(ACCESS_TOKEN_KEY)
      : (browserStorage()?.getItem(ACCESS_TOKEN_KEY) ?? undefined)
  } catch {
    return undefined
  }
}

export function setAccessToken(token: string, expiresAt: Date): void {
  try {
    USE_COOKIES
      ? cookies.set(ACCESS_TOKEN_KEY, token, { expires: expiresAt })
      : browserStorage()?.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function clearAccessToken(): void {
  try {
    cookies.remove(ACCESS_TOKEN_KEY)
    browserStorage()?.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    // Clearing an unavailable storage is already the desired outcome.
  }
}
