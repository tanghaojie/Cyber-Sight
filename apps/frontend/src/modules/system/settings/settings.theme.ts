export const THEME_COLORS = ['jade', 'civic', 'monochrome', 'azure', 'violet', 'amber'] as const

export type ThemeColor = (typeof THEME_COLORS)[number]

export interface ThemeColorOption {
  value: ThemeColor
  color: string
}

export const THEME_COLOR_OPTIONS: readonly ThemeColorOption[] = [
  { value: 'jade', color: '#23734c' },
  { value: 'civic', color: '#b4232c' },
  { value: 'monochrome', color: '#1b1b1b' },
  { value: 'azure', color: '#1769aa' },
  { value: 'violet', color: '#6846c7' },
  { value: 'amber', color: '#b65c00' },
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
