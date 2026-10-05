<script setup lang="ts">
import type { ArticleVersion, VersionSummary } from './draft-storage.port'

defineProps<{
  versions: VersionSummary[]
  selected?: ArticleVersion
  busy: boolean
  blocked: boolean
  error: string
}>()
const emit = defineEmits<{
  create: []
  refresh: []
  view: [timestamp: number]
  restore: [timestamp: number]
  delete: [timestamp: number]
}>()

function versionTime(timestamp: number): string {
  const time = new Date(timestamp)
  return `${time.toLocaleString('zh-CN', { hour12: false })}.${String(time.getMilliseconds()).padStart(3, '0')}`
}
function restore(timestamp: number): void {
  if (
    window.confirm(
      '恢复将替换当前文章。需要保留当前内容时，请先新增版本。排版配置和固定结尾继续使用当前设置。',
    )
  ) {
    emit('restore', timestamp)
  }
}
function remove(timestamp: number): void {
  if (window.confirm('删除此历史版本？此操作无法撤销，当前文章会保留。')) {
    emit('delete', timestamp)
  }
}
</script>

<template>
  <section class="history-panel" :aria-busy="busy">
    <p class="hint">
      文章自动保存到当前草稿。只有主动新增版本才会保留历史；版本不包含排版配置和固定结尾。
    </p>
    <div class="history-actions">
      <el-button :disabled="busy || blocked" @click="emit('create')">新增版本</el-button>
      <el-button :disabled="busy" @click="emit('refresh')">刷新列表</el-button>
    </div>
    <p v-if="blocked" class="error">当前文章保存已暂停，请备份原稿后刷新页面。</p>
    <p v-if="error" class="error" role="alert">{{ error }}</p>
    <p v-if="busy" class="hint" role="status">正在处理…</p>
    <p v-else-if="!error && !versions.length" class="hint">
      还没有历史版本。点击「新增版本」保留当前文章。
    </p>
    <ol class="version-list">
      <li
        v-for="version in versions"
        :key="version.timestamp"
        :class="{ selected: selected?.timestamp === version.timestamp }"
      >
        <strong>{{ version.title }}</strong>
        <time :datetime="new Date(version.timestamp).toISOString()">{{
          versionTime(version.timestamp)
        }}</time>
        <small>{{ version.characters.toLocaleString() }} 个 Markdown 字符</small>
        <div class="version-actions">
          <button :disabled="busy" @click="emit('view', version.timestamp)">查看</button>
          <button :disabled="busy || blocked" @click="restore(version.timestamp)">恢复</button>
          <button :disabled="busy" @click="remove(version.timestamp)">删除</button>
        </div>
      </li>
    </ol>
    <template v-if="selected">
      <h3>版本原稿 · {{ versionTime(selected.timestamp) }}</h3>
      <textarea
        aria-label="历史版本 Markdown（只读）"
        :value="selected.draft.article.markdown"
        readonly
        spellcheck="false"
      />
    </template>
  </section>
</template>

<style scoped>
.history-panel {
  padding: 20px;
  color: var(--ui-text);
}
.hint,
.error {
  font-size: 12px;
  line-height: 1.8;
  margin: 0 0 16px;
}
.error {
  color: var(--ui-warning);
  overflow-wrap: anywhere;
}
.history-actions {
  display: flex;
  margin-bottom: 18px;
}
.history-actions .el-button {
  font-size: 12px;
}
.version-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.version-list li {
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
}
.version-list li.selected {
  border-color: var(--ui-primary);
  background: var(--ui-active);
}
strong {
  display: block;
  font-size: 13px;
  overflow-wrap: anywhere;
}
time,
small {
  display: block;
  font-size: 12px;
  margin-top: 6px;
  color: var(--ui-muted);
}
.version-actions {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.version-actions button {
  border: 0;
  background: none;
  padding: 0;
  color: var(--ui-primary);
  cursor: pointer;
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}
h3 {
  font-size: 12px;
  line-height: 1.8;
  margin-top: 20px;
}
textarea {
  width: 100%;
  min-height: 220px;
  padding: 12px;
  resize: vertical;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--ui-text);
  background: var(--ui-bg);
}
</style>
