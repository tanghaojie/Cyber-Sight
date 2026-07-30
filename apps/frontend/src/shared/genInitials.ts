/** 从品牌名提取前两个 ASCII 字母或数字；无法提取时使用 JT 作为稳定占位。 */
export function genInitials(name: string): string {
  return (
    name
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || 'JT'
  )
}
