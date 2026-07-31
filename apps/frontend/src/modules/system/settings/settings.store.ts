import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { browserStorage } from '@/shared/browserStorage'

const STORAGE_KEY = 'cyber_system_settings:v1'

const NAVIGATION_MENU_STYLES = ['sidebar', 'top'] as const
const THEME_COLORS = ['aurora', 'ocean', 'violet', 'sunset'] as const

export type NavigationMenuStyle = (typeof NAVIGATION_MENU_STYLES)[number]
export type ThemeColor = (typeof THEME_COLORS)[number]

export interface SystemSettings {
  navigationMenuStyle: NavigationMenuStyle
  themeColor: ThemeColor
  darkMode: boolean
  tagsView: boolean
  sidebarLogo: boolean
  dynamicTitle: boolean
}

export const DEFAULT_SYSTEM_SETTINGS: Readonly<SystemSettings> = Object.freeze({
  navigationMenuStyle: 'sidebar',
  themeColor: 'aurora',
  darkMode: false,
  tagsView: true,
  sidebarLogo: true,
  dynamicTitle: true,
})

function isNavigationMenuStyle(value: unknown): value is NavigationMenuStyle {
  return typeof value === 'string' && NAVIGATION_MENU_STYLES.includes(value as NavigationMenuStyle)
}

function isThemeColor(value: unknown): value is ThemeColor {
  return typeof value === 'string' && THEME_COLORS.includes(value as ThemeColor)
}

function createDefaultSettings(): SystemSettings {
  return { ...DEFAULT_SYSTEM_SETTINGS }
}

function normalizeSettings(value: unknown): SystemSettings | undefined {
  if (typeof value !== 'object' || value === null) {
    return
  }

  const candidate = value as Partial<SystemSettings>
  if (
    !isNavigationMenuStyle(candidate.navigationMenuStyle) ||
    !isThemeColor(candidate.themeColor) ||
    typeof candidate.darkMode !== 'boolean' ||
    typeof candidate.tagsView !== 'boolean' ||
    typeof candidate.sidebarLogo !== 'boolean' ||
    typeof candidate.dynamicTitle !== 'boolean'
  ) {
    return
  }

  return {
    navigationMenuStyle: candidate.navigationMenuStyle,
    themeColor: candidate.themeColor,
    darkMode: candidate.darkMode,
    tagsView: candidate.tagsView,
    sidebarLogo: candidate.sidebarLogo,
    dynamicTitle: candidate.dynamicTitle,
  }
}

function restoreSettings(): SystemSettings {
  try {
    const raw = browserStorage()?.getItem(STORAGE_KEY)
    if (!raw) {
      return createDefaultSettings()
    }

    return normalizeSettings(JSON.parse(raw)) ?? createDefaultSettings()
  } catch {
    // 存储被禁用或数据损坏时使用默认值，管理端仍可在内存中继续运行。
    return createDefaultSettings()
  }
}

/** 管理设备级界面偏好；预留设置只持久化，不在本模块内改变应用壳行为。 */
export const useSettingsStore = defineStore('settings', () => {
  const current = ref<SystemSettings>(restoreSettings())
  const settings = computed<Readonly<SystemSettings>>(() => current.value)

  function persist(): void {
    try {
      browserStorage()?.setItem(STORAGE_KEY, JSON.stringify(current.value))
    } catch {
      // 配额不足或浏览器限制写入时保留当前会话内存值。
    }
  }

  function save(value: SystemSettings): void {
    const normalized = normalizeSettings(value)
    if (!normalized) {
      return
    }

    current.value = normalized
    persist()
  }

  function reset(): void {
    current.value = createDefaultSettings()
    try {
      browserStorage()?.removeItem(STORAGE_KEY)
    } catch {
      // 无法清理存储时，当前会话仍以默认设置运行。
    }
  }

  return { settings, save, reset }
})
