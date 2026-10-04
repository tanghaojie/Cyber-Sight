import type { ArticleDocument } from '../article/article.model'
import type { TypesettingConfig } from '../typesetting/typesetting.model'
import type { FixedEnding } from '../ending/ending.model'
import type { PreparedAsset } from '../assets/assets.model'

export interface WorkspaceDraft {
  schemaVersion: 1
  article: ArticleDocument
  config: TypesettingConfig
  ending: FixedEnding
  assets: PreparedAsset[]
  ratio: number
  previewMode: 'phone' | 'desktop'
}

export interface DraftStorage {
  load(): Promise<unknown>
  save(draft: WorkspaceDraft): Promise<void>
}
