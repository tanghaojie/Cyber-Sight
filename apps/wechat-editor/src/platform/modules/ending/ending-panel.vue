<script setup lang="ts">
import type { FixedEnding } from './ending.model'
const props = defineProps<{ ending: FixedEnding }>()
const emit = defineEmits<{ change: [patch: Partial<FixedEnding>] }>()
const snippets = [
  { name: '名片', markdown: '---\n\n**作者 / 公众号名称**\n\n在这里写一句介绍。' },
  { name: '关注提示', markdown: '---\n\n如果这篇文章对你有帮助，欢迎关注、点赞或分享。' },
  {
    name: '往期精选',
    markdown:
      '---\n\n**往期精选**\n\n- [文章标题](https://mp.weixin.qq.com/)\n- [另一篇文章](https://mp.weixin.qq.com/)',
  },
]
function appendSnippet(markdown: string): void {
  const value = [props.ending.markdown.trimEnd(), markdown].filter(Boolean).join('\n\n')
  if (value.length <= 500000) {
    emit('change', { markdown: value })
  }
}
</script>

<template>
  <div class="ending-body">
    <p class="intro">留一个熟悉的结尾，每篇文章都可以用。</p>
    <label class="ending-switch"
      >启用固定结尾<el-switch
        :model-value="ending.enabled"
        @update:model-value="emit('change', { enabled: Boolean($event) })"
    /></label>
    <label class="ending-label" for="ending-markdown">结尾 Markdown</label>
    <div class="snippet-buttons">
      <button
        v-for="snippet in snippets"
        :key="snippet.name"
        class="ui-button bordered"
        :disabled="ending.markdown.length + snippet.markdown.length + 2 > 500000"
        @click="appendSnippet(snippet.markdown)"
      >
        ＋ {{ snippet.name }}
      </button>
    </div>
    <textarea
      id="ending-markdown"
      :value="ending.markdown"
      maxlength="500000"
      @input="emit('change', { markdown: ($event.target as HTMLTextAreaElement).value })"
    />
    <div class="ending-actions">
      <el-button size="small" @click="emit('change', { markdown: '' })">清空</el-button>
    </div>
    <p class="note">
      片段追加到现有结尾，不会自动启用。请替换示例名称和链接。修改即预览，结尾设置即时保存到当前浏览器。
    </p>
  </div>
</template>

<style scoped>
.ending-body {
  padding: 22px;
}
.intro,
.note {
  font-size: 12px;
  line-height: 1.9;
  color: var(--ui-muted);
}
.intro {
  margin: 0 0 24px;
}
.ending-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: var(--ui-text);
}
.ending-label {
  display: block;
  margin: 25px 0 12px;
  font-size: 13px;
  color: var(--ui-text);
}
textarea {
  width: 100%;
  height: 300px;
  resize: vertical;
  border: 1px solid var(--ui-border);
  border-radius: 8px;
  padding: 12px;
  font:
    13px/1.9 Consolas,
    'Microsoft YaHei',
    monospace;
  color: var(--ui-text);
  outline-color: var(--ui-primary);
}
.snippet-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-bottom: 12px;
}
.snippet-buttons button {
  font-size: 12px;
  padding: 4px 7px;
}
.ending-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
</style>
