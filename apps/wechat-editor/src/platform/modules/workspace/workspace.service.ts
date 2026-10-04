import type { WorkspaceDraft } from './draft-storage.port'
import { isColor } from '../article/article.service'
import { chapterStyles } from '../typesetting/typesetting.model'
import { maxMarkdownLength } from '../../app.config'

export function validateDraft(value: unknown): WorkspaceDraft {
  const draft = value as WorkspaceDraft
  const valid =
    draft &&
    draft.schemaVersion === 1 &&
    draft.article?.schemaVersion === 1 &&
    typeof draft.article.id === 'string' &&
    typeof draft.article.markdown === 'string' &&
    draft.article.markdown.length <= maxMarkdownLength &&
    Number.isInteger(draft.article.revision) &&
    draft.article.revision >= 0 &&
    Array.isArray(draft.article.annotations) &&
    draft.article.annotations.length <= 10_000 &&
    draft.article.annotations.every(
      (a) =>
        typeof a.id === 'string' &&
        Number.isInteger(a.start) &&
        a.start >= 0 &&
        Number.isInteger(a.end) &&
        a.end > a.start &&
        a.end <= maxMarkdownLength * 2 &&
        isColor(a.color) &&
        typeof a.invalid === 'boolean',
    ) &&
    draft.config &&
    ['body', 'heading', 'accent', 'muted', 'background'].every((role) =>
      isColor(draft.config.colors?.[role as keyof typeof draft.config.colors]),
    ) &&
    chapterStyles.some(([id]) => id === draft.config.chapterStyle) &&
    [
      draft.config.fontSize,
      draft.config.lineHeight,
      draft.config.paragraphGap,
      draft.config.letterSpacing,
    ].every(Number.isFinite) &&
    draft.config.fontSize >= 14 &&
    draft.config.fontSize <= 18 &&
    draft.config.lineHeight >= 1.6 &&
    draft.config.lineHeight <= 2.2 &&
    draft.config.paragraphGap >= 8 &&
    draft.config.paragraphGap <= 40 &&
    draft.config.letterSpacing >= 0 &&
    draft.config.letterSpacing <= 3 &&
    ['default', 'sans', 'serif'].includes(draft.config.font) &&
    typeof draft.config.backgroundEnabled === 'boolean' &&
    draft.ending?.schemaVersion === 1 &&
    typeof draft.ending.enabled === 'boolean' &&
    typeof draft.ending.markdown === 'string' &&
    draft.ending.markdown.length <= maxMarkdownLength &&
    Array.isArray(draft.assets) &&
    draft.assets.length <= 100 &&
    draft.assets.every(
      (a) =>
        /^[\da-f-]+$/i.test(a.id) &&
        a.blob instanceof Blob &&
        ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(a.blob.type) &&
        a.blob.size <= 10 * 1024 * 1024,
    ) &&
    Number.isFinite(draft.ratio) &&
    draft.ratio > 0 &&
    draft.ratio < 1 &&
    ['phone', 'desktop'].includes(draft.previewMode)
  if (!valid) {
    throw new Error(
      '本地草稿版本或数据异常，原数据已保留。请先下载当前内容，再决定是否覆盖本地草稿。',
    )
  }
  return draft
}

export function splitBounds(width: number): { min: number; max: number } {
  const available = Math.max(600, width - 12)
  return { min: 280 / available, max: 1 - 320 / available }
}

export function clampRatio(ratio: number, width: number): number {
  const { min, max } = splitBounds(width)
  return Math.max(min, Math.min(max, ratio))
}

export function downloadText(
  text: string,
  name: string,
  mime = 'text/markdown;charset=utf-8',
): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = name
  anchor.click()
  setTimeout(function release() {
    URL.revokeObjectURL(url)
  }, 1000)
}
