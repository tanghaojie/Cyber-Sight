export const chapterStyles = [
  ['underline', '下划线'],
  ['slash', '斜线'],
  ['bar', '竖线'],
  ['box', '方框'],
  ['bracket', '方括号'],
  ['circles', '双圆'],
  ['dots', '点阵'],
  ['overline', '上置号'],
  ['quote', '引号'],
] as const
export type ChapterStyle = (typeof chapterStyles)[number][0]
export type ColorRole = 'body' | 'heading' | 'accent' | 'muted' | 'background'
export interface TypesettingConfig {
  preset: string
  colors: Record<ColorRole, string>
  chapterStyle: ChapterStyle
  fontSize: number
  lineHeight: number
  paragraphGap: number
  letterSpacing: number
  font: 'default' | 'sans' | 'serif'
  backgroundEnabled: boolean
}
