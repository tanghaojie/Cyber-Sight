const ACCESS_TOKEN_KEY = 'scaffold_access_token'

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

export function getAccessToken(): string | null {
  try {
    return browserStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null
  } catch {
    return null
  }
}

export function setAccessToken(token: string): void {
  try {
    browserStorage()?.setItem(ACCESS_TOKEN_KEY, token)
  } catch {
    // Storage can be unavailable in restricted browser contexts.
  }
}

export function clearAccessToken(): void {
  try {
    browserStorage()?.removeItem(ACCESS_TOKEN_KEY)
  } catch {
    // Clearing an unavailable storage is already the desired outcome.
  }
}
