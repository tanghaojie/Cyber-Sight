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
