import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import { exampleMarkdown, maxMarkdownLength } from '../../app.config'
import type { ArticleDocument, TextSelection } from '../article/article.model'
import {
  addAnnotation,
  articleStatistics,
  migrateAnnotations,
  renderMarkdown,
} from '../article/article.service'
import { defaultTypesetting, presets } from '../typesetting/typesetting.service'
import type { TypesettingConfig } from '../typesetting/typesetting.model'
import { defaultEnding } from '../ending/ending.service'
import type { PreparedAsset } from '../assets/assets.model'
import { createAssetUrls, releaseAssetUrls } from '../assets/assets.service'
import { previewArticle, exportArticle, copyRichText } from '../wechat-export/wechat-export.service'
import type { ExportResult, ExportSnapshot, Diagnostic } from '../wechat-export/wechat-export.model'
import type { WorkspaceDraft } from './draft-storage.port'
import { createDraftStorage } from './adapters/indexeddb-storage'
import { validateDraft } from './workspace.service'

export const useWorkspaceStore = defineStore('jlab-workspace', function workspaceStore() {
  const article = ref<ArticleDocument>({
    schemaVersion: 1,
    id: crypto.randomUUID(),
    markdown: exampleMarkdown,
    revision: 0,
    updatedAt: Date.now(),
    annotations: [],
  })
  const config = ref(defaultTypesetting())
  const ending = ref(defaultEnding())
  const assets = ref<PreparedAsset[]>([])
  const ratio = ref(0.5)
  const previewMode = ref<'phone' | 'desktop'>('phone')
  const drawer = ref<'text' | 'colors' | 'ending' | 'chapters' | undefined>()
  const focus = ref(false)
  const ready = ref(false)
  const dirty = ref(false)
  const saveState = ref('正在读取草稿…')
  const saveBlocked = ref(false)
  const copyState = ref<'idle' | 'preparing' | 'ready' | 'copying' | 'success' | 'error'>('idle')
  const message = ref('')
  const diagnostics = ref<Diagnostic[]>([])
  const exportResult = ref<ExportResult>()
  const urls = ref(new Map<string, string>())
  const storage = createDraftStorage()
  let timer: ReturnType<typeof setTimeout> | undefined
  let saveQueue = Promise.resolve()
  let generation = 0
  let exportGeneration = 0
  const channel =
    typeof BroadcastChannel === 'undefined'
      ? undefined
      : new BroadcastChannel('jlab-wechat-editor-draft')
  if (channel) {
    channel.onmessage = function externalSave() {
      saveBlocked.value = true
      saveState.value = '另一页面更新了草稿，请复制原稿到本地文件后刷新页面。'
    }
  }

  function snapshot(): ExportSnapshot {
    return {
      article: JSON.parse(JSON.stringify(article.value)),
      config: JSON.parse(JSON.stringify(config.value)),
      ending: JSON.parse(JSON.stringify(ending.value)),
      assets: assets.value.map((a) => ({ ...a, blob: a.blob })),
    }
  }
  const preview = computed(function renderPreview() {
    return previewArticle(snapshot(), urls.value)
  })
  const invalidAnnotations = computed(
    () => article.value.annotations.filter((a) => a.invalid).length,
  )
  const statistics = computed(function measureArticle() {
    return articleStatistics(
      article.value.markdown + (ending.value.enabled ? '\n\n' + ending.value.markdown : ''),
    )
  })

  function rebuildUrls(): void {
    releaseAssetUrls(urls.value)
    urls.value = createAssetUrls(assets.value)
  }

  async function initialize(): Promise<void> {
    try {
      const stored = await storage.load()
      if (stored !== undefined) {
        const draft = validateDraft(stored)
        article.value = draft.article
        config.value = draft.config
        ending.value = draft.ending
        assets.value = draft.assets
        ratio.value = draft.ratio
        previewMode.value = draft.previewMode
        rebuildUrls()
      }
      saveState.value = stored ? '已恢复本地草稿' : '修改后自动保存到本机'
    } catch (error) {
      saveBlocked.value = true
      saveState.value = '草稿读取失败，自动保存已暂停'
      message.value =
        error instanceof Error ? error.message : '无法读取草稿，请检查浏览器存储权限。'
    } finally {
      ready.value = true
    }
  }

  function changed(): void {
    generation++
    dirty.value = true
    exportResult.value = undefined
    copyState.value = 'idle'
    diagnostics.value = []
    if (timer) {
      clearTimeout(timer)
    }
    if (!saveBlocked.value) {
      saveState.value = '有修改，等待保存…'
      timer = setTimeout(function autosave() {
        void saveNow()
      }, 450)
    }
  }
  watch(
    [article, config, ending, assets, ratio, previewMode],
    function draftChanged() {
      if (ready.value) {
        changed()
      }
    },
    { deep: true, flush: 'sync' },
  )

  async function saveNow(): Promise<void> {
    if (timer) {
      clearTimeout(timer)
    }
    if (!ready.value || saveBlocked.value) {
      return
    }
    const version = generation
    const draft: WorkspaceDraft = {
      schemaVersion: 1,
      ...snapshot(),
      ratio: ratio.value,
      previewMode: previewMode.value,
    }
    saveState.value = '保存中…'
    saveQueue = saveQueue.then(async function persist() {
      if (saveBlocked.value) {
        return
      }
      try {
        await storage.save(draft)
        if (version === generation) {
          saveState.value = '已保存到本机'
          dirty.value = false
        }
        channel?.postMessage({ saved: true })
      } catch {
        saveState.value = '保存失败，请复制原稿到本地文件备份并重试'
      }
    })
    await saveQueue
  }

  function updateMarkdown(markdown: string): void {
    if (markdown.length > maxMarkdownLength) {
      message.value = '文章超过 50 万字符，请拆分后再导入。'
      return
    }
    const before = renderMarkdown(article.value.markdown).text
    const after = renderMarkdown(markdown).text
    const revision = article.value.revision + 1
    article.value = {
      ...article.value,
      markdown,
      revision,
      updatedAt: Date.now(),
      annotations: migrateAnnotations(before, after, article.value.annotations, revision),
    }
    pruneAssets()
  }
  function pruneAssets(): void {
    const markdown = article.value.markdown + '\n' + ending.value.markdown
    const used = assets.value.filter((asset) => markdown.includes(`asset:${asset.id}`))
    if (used.length !== assets.value.length) {
      assets.value = used
      rebuildUrls()
    }
  }
  watch(ending, pruneAssets, { deep: true })
  function setConfig(patch: Partial<TypesettingConfig>): void {
    config.value = { ...config.value, ...patch }
  }
  function choosePreset(id: string): void {
    const preset = presets.find((p) => p.id === id)
    if (preset) {
      setConfig({ preset: preset.id, colors: { ...preset.colors } })
    }
  }
  function colorSelection(selection: TextSelection | undefined, color: string): void {
    if (!selection || selection.revision !== article.value.revision) {
      message.value = '请重新选中右侧预览中的正文文字，再设置颜色。'
      return
    }
    article.value = {
      ...article.value,
      annotations: addAnnotation(article.value.annotations, selection, color),
      updatedAt: Date.now(),
    }
  }
  function toggleDrawer(kind: 'text' | 'colors' | 'ending' | 'chapters'): void {
    drawer.value = drawer.value === kind ? undefined : kind
  }
  async function prepareCopy(): Promise<void> {
    if (copyState.value === 'preparing' || copyState.value === 'copying') {
      return
    }
    copyState.value = 'preparing'
    message.value = ''
    const current = generation
    const job = ++exportGeneration
    try {
      const result = await exportArticle(snapshot())
      if (current !== generation || job !== exportGeneration) {
        message.value = '准备期间内容已修改，请重新复制。'
        copyState.value = 'idle'
        return
      }
      diagnostics.value = result.diagnostics
      if (result.diagnostics.some((d) => d.level === 'error')) {
        copyState.value = 'error'
        message.value = '请处理下方图片或内容问题后再复制。'
        return
      }
      exportResult.value = result
      await copyPrepared()
    } catch (error) {
      copyState.value = exportResult.value ? 'ready' : 'error'
      message.value = error instanceof Error ? error.message : '复制失败，请重试。'
    }
  }
  async function copyPrepared(): Promise<void> {
    if (!exportResult.value) {
      return
    }
    copyState.value = 'copying'
    try {
      await copyRichText(exportResult.value)
      copyState.value = 'success'
      message.value = '已复制图文，请到公众号编辑器粘贴，并检查保存后的效果。'
    } catch (error) {
      copyState.value = 'ready'
      message.value =
        error instanceof Error && error.message.startsWith('富文本复制需要')
          ? error.message
          : '内容已准备好，浏览器未允许复制。请再次点击「复制已准备内容」，或检查剪贴板权限。'
    }
  }
  function dispose(): void {
    if (timer) {
      clearTimeout(timer)
    }
    releaseAssetUrls(urls.value)
    channel?.close()
  }

  return {
    article,
    config,
    ending,
    assets,
    ratio,
    previewMode,
    drawer,
    focus,
    ready,
    dirty,
    saveState,
    saveBlocked,
    copyState,
    message,
    diagnostics,
    exportResult,
    preview,
    invalidAnnotations,
    statistics,
    snapshot,
    initialize,
    saveNow,
    updateMarkdown,
    setConfig,
    choosePreset,
    colorSelection,
    toggleDrawer,
    prepareCopy,
    copyPrepared,
    dispose,
  }
})
