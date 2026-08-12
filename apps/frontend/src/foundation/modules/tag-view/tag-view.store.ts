import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { EntityIdSchema, type EntityId } from '@cyber-ai-forge/api-contract'
import { browserStorage } from '@/foundation/shared/browserStorage'
import { platformStorageKey } from '@/foundation/platform/platform'

function storageKey(userId: EntityId): string {
  return platformStorageKey(`tag_view_history:v2:${userId}`)
}

export interface TagViewItem {
  path: string
  title: string
}

function isValidPath(path: string): boolean {
  return (
    path.startsWith('/') && !path.startsWith('//') && !path.includes('?') && !path.includes('#')
  )
}

function normalizeTag(value: unknown): TagViewItem | undefined {
  if (typeof value !== 'object' || value === null) {
    return
  }

  const path = 'path' in value && typeof value.path === 'string' ? value.path.trim() : ''
  const title = 'title' in value && typeof value.title === 'string' ? value.title.trim() : ''
  if (!isValidPath(path) || !title) {
    return
  }
  return { path, title }
}

function restoreTags(userId: EntityId): TagViewItem[] {
  try {
    const raw = browserStorage()?.getItem(storageKey(userId))
    if (!raw) {
      return []
    }

    const value: unknown = JSON.parse(raw)
    if (!Array.isArray(value)) {
      return []
    }

    const paths = new Set<string>()
    const tags: TagViewItem[] = []
    for (const item of value) {
      const tag = normalizeTag(item)
      if (!tag || paths.has(tag.path)) {
        continue
      }
      paths.add(tag.path)
      tags.push(tag)
    }
    return tags
  } catch {
    // localStorage 被禁用或历史 JSON 损坏时降级为空历史，不阻断页面导航。
    return []
  }
}

/** 管理账号隔离的页面标签历史，并把每次变更同步到浏览器持久化。 */
export const useTagViewStore = defineStore('tag-view', () => {
  const activeUserId = ref<EntityId | null>(null)
  const items = ref<TagViewItem[]>([])
  const tags = computed<readonly TagViewItem[]>(() => items.value)

  function persist(): void {
    if (activeUserId.value === null) {
      return
    }
    try {
      browserStorage()?.setItem(storageKey(activeUserId.value), JSON.stringify(items.value))
    } catch {
      // 配额不足或浏览器限制持久化时保留内存状态，当前会话仍可继续使用。
    }
  }

  function activate(userId: EntityId): void {
    if (!EntityIdSchema.safeParse(userId).success) {
      deactivate()
      return
    }
    if (activeUserId.value === userId) {
      return
    }

    activeUserId.value = userId
    items.value = restoreTags(userId)
  }

  function deactivate(): void {
    activeUserId.value = null
    items.value = []
  }

  function open(target: TagViewItem): void {
    if (activeUserId.value === null) {
      return
    }
    const tag = normalizeTag(target)
    if (!tag) {
      return
    }

    const index = items.value.findIndex((item) => item.path === tag.path)
    if (index >= 0) {
      if (items.value[index]?.title !== tag.title) {
        items.value[index] = tag
        persist()
      }
      return
    }

    items.value.push(tag)
    persist()
  }

  function close(path: string): TagViewItem | undefined {
    const index = items.value.findIndex((item) => item.path === path)
    if (index < 0) {
      return
    }

    // 优先选择右侧标签，关闭列表末项时再退到左侧，保持连续的工作流。
    const fallback = items.value[index + 1] ?? items.value[index - 1]
    items.value.splice(index, 1)
    persist()
    return fallback ? { ...fallback } : undefined
  }

  function closeOthers(path: string): void {
    const current = items.value.find((item) => item.path === path)
    items.value = current ? [{ ...current }] : []
    persist()
  }

  function closeAll(): void {
    items.value = []
    persist()
  }

  return { tags, activate, deactivate, open, close, closeOthers, closeAll }
})
