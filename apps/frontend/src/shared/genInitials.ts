import { appConfig } from '@/config/app.config'

export function brandInitials(): string {
  return genInitials(appConfig.name)
}

/**
 * 生成首字母
 * @param name
 * @returns
 */
export function genInitials(name: string): string {
  return (
    name
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || 'JT'
  )
}
