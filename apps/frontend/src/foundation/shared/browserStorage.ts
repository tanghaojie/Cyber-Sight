/**
 * 在浏览器环境安全获取 localStorage；SSR、隐私模式或被策略限制时返回 null。
 */
export function browserStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    return window.localStorage
  } catch {
    return null
  }
}
