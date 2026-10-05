<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { readSelection } from './article.service'
import type { TextSelection } from './article.model'

const props = defineProps<{
  html: string
  revision: number
  mode: 'phone' | 'desktop'
  focus: boolean
  disabled: boolean
}>()
const emit = defineEmits<{
  selection: [value: TextSelection | undefined]
  error: [message: string]
  mode: [value: 'phone' | 'desktop']
  focus: []
}>()
const root = ref<HTMLElement>()
function selectionChanged(): void {
  if (!root.value) {
    return
  }
  const selection = window.getSelection()
  if (!selection?.anchorNode || !root.value.contains(selection.anchorNode)) {
    return
  }
  try {
    emit('selection', readSelection(root.value, props.revision))
  } catch (error) {
    emit('selection', undefined)
    emit('error', error instanceof Error ? error.message : '请重新选择文字。')
  }
}
onMounted(function listen() {
  document.addEventListener('selectionchange', selectionChanged)
})
onBeforeUnmount(function unlisten() {
  document.removeEventListener('selectionchange', selectionChanged)
})
</script>

<template>
  <section class="preview-pane">
    <div class="preview-heading">
      <span>排版预览</span>
      <div class="preview-actions">
        <el-radio-group
          :model-value="mode"
          size="small"
          :disabled="disabled"
          aria-label="预览宽度"
          @update:model-value="emit('mode', $event as 'phone' | 'desktop')"
        >
          <el-radio-button value="phone">手机宽度</el-radio-button>
          <el-radio-button value="desktop">电脑宽度</el-radio-button>
        </el-radio-group>
        <el-button
          size="small"
          text
          :disabled="disabled"
          :aria-pressed="focus"
          @click="emit('focus')"
          >{{ focus ? '返回编辑' : '专注预览' }}</el-button
        >
      </div>
    </div>
    <div class="preview-scroll">
      <div class="paper" :class="mode">
        <article title="选中文字可局部改色" ref="root" v-html="html" />
      </div>
      <p class="paper-note">预览仅作排版参考，公众号粘贴并保存后请再检查。</p>
    </div>
  </section>
</template>

<style scoped>
.preview-pane {
  border-left: 1px solid #e8e3ef;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  background: #f1f0f5;
}
.preview-heading {
  height: 52px;
  padding: 0 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #faf9fc;
  border-bottom: 1px solid #e8e6ee;
  color: #61596e;
  font-size: 12px;
}
.preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.preview-actions :deep(.el-radio-button__inner) {
  padding: 6px 8px;
}
.preview-scroll {
  flex: 1;
  overflow: auto;
  padding: 30px 18px 16px;
}
.paper {
  margin: 0 auto;
  background: white;
  min-height: 540px;
  padding: 30px 24px;
  box-shadow: 0 5px 28px #4338590b;
  border: 1px solid #e9e5ef;
}
.paper.phone {
  width: 375px;
  max-width: 100%;
}
.paper.desktop {
  width: 760px;
  max-width: 100%;
  padding: 36px;
}
.paper-note {
  text-align: center;
  color: #9c94a7;
  font-size: 11px;
  margin: 20px 0 6px;
}
article :deep(::selection) {
  background: #dcd0ff;
}
</style>
