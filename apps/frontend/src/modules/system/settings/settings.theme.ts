export const THEME_COLORS = ['jade', 'civic', 'monochrome', 'azure', 'violet', 'amber'] as const

export type ThemeColor = (typeof THEME_COLORS)[number]

export interface ThemeColorOption {
  value: ThemeColor
  color: string
  darkColor: string
}

export const THEME_COLOR_OPTIONS: readonly ThemeColorOption[] = [
  { value: 'jade', color: '#277a52', darkColor: '#57b985' },
  { value: 'civic', color: '#b33943', darkColor: '#d96069' },
  { value: 'monochrome', color: '#292927', darkColor: '#e3e2dd' },
  { value: 'azure', color: '#2b72a6', darkColor: '#62a7da' },
  { value: 'violet', color: '#7251b2', darkColor: '#9e7dd8' },
  { value: 'amber', color: '#a85d14', darkColor: '#d89342' },
]

const LEGACY_THEME_COLORS: Readonly<Record<string, ThemeColor>> = {
  aurora: 'jade',
  ocean: 'azure',
  violet: 'violet',
  sunset: 'amber',
}

export function normalizeThemeColor(value: unknown): ThemeColor | undefined {
  if (typeof value !== 'string') {
    return
  }

  if (THEME_COLORS.includes(value as ThemeColor)) {
    return value as ThemeColor
  }

  return LEGACY_THEME_COLORS[value]
}
