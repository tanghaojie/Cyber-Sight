<script setup lang="ts">
import type { FixedEnding } from './ending.model'
defineProps<{ ending: FixedEnding }>()
const emit = defineEmits<{ change: [patch: Partial<FixedEnding>] }>()
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
    <textarea
      id="ending-markdown"
      :value="ending.markdown"
      maxlength="500000"
      @input="emit('change', { markdown: ($event.target as HTMLTextAreaElement).value })"
    />
    <div class="ending-actions">
      <el-button size="small" @click="emit('change', { markdown: '' })">清空</el-button>
    </div>
    <p class="note">启用后追加在文章末尾，不改正文原稿。修改即预览，并随草稿自动保存。</p>
  </div>
</template>

<style scoped>
.ending-body {
  padding: 22px;
}
.intro,
.note {
  font-size: 11px;
  line-height: 1.9;
  color: #998ca8;
}
.intro {
  margin: 0 0 24px;
}
.ending-switch {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #665976;
}
.ending-label {
  display: block;
  margin: 25px 0 12px;
  font-size: 12px;
  color: #776683;
}
textarea {
  width: 100%;
  height: 300px;
  resize: vertical;
  border: 1px solid #e8e0ef;
  border-radius: 8px;
  padding: 12px;
  font:
    12px/1.9 Consolas,
    'Microsoft YaHei',
    monospace;
  color: #5d536a;
  outline-color: #9b7bd1;
}
.ending-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
}
</style>
