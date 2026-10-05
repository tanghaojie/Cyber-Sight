<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { readSelection } from './article.service'
import type { TextSelection } from './article.model'
import ColorPicker from '../typesetting/typesetting-color-picker.vue'
const props = defineProps<{
  html: string
  revision: number
  mode: 'phone' | 'desktop'
  focus: boolean
  disabled: boolean
  accent: string
  localColor: string
}>()
const emit = defineEmits<{
  selection: [value: TextSelection | undefined]
  error: [message: string]
  mode: [value: 'phone' | 'desktop']
  focus: []
  color: [color: string]
  clear: []
}>()
const root = ref<HTMLElement>()
const pane = ref<HTMLElement>()
const paper = ref<HTMLElement>()
const bubble = ref<HTMLElement>()
const showFrame = ref(true)
const bubbleOpen = ref(false)
const bubblePosition = ref({ left: '0px', top: '0px' })
const measuredWidth = ref(375)
const quickColors = computed(() => [
  ...new Set([props.accent, '#b7791f', '#c2410c', '#0f766e', '#30323d']),
])
let observer: ResizeObserver | undefined
function closeSelection(): void {
  bubbleOpen.value = false
  emit('selection', undefined)
}
function captureSelection(): TextSelection | undefined {
  if (!root.value || props.disabled) {
    return
  }
  try {
    const value = readSelection(root.value, props.revision)
    if (value) {
      emit('selection', value)
    }
    return value
  } catch (error) {
    closeSelection()
    emit('error', error instanceof Error ? error.message : '请重新选择文字。')
  }
}
async function selectionFinished(): Promise<void> {
  if (!captureSelection()) {
    closeSelection()
    return
  }
  const range = window.getSelection()?.getRangeAt(0)
  if (!range || !pane.value) {
    return
  }
  const rect = range.getBoundingClientRect()
  bubbleOpen.value = true
  await nextTick()
  if (!bubble.value || !pane.value || !bubbleOpen.value) {
    return
  }
  const bounds = pane.value.getBoundingClientRect()
  const width = bubble.value.offsetWidth
  const height = bubble.value.offsetHeight
  const above = rect.top - bounds.top - height - 8
  bubblePosition.value = {
    left: `${Math.max(8, Math.min(bounds.width - width - 8, rect.left - bounds.left + (rect.width - width) / 2))}px`,
    top: `${Math.max(8, Math.min(bounds.height - height - 8, above >= 8 ? above : rect.bottom - bounds.top + 8))}px`,
  }
}
function changedSelection(): void {
  const selection = window.getSelection()
  if (!selection?.anchorNode || !root.value?.contains(selection.anchorNode)) {
    return
  }
  if (selection.isCollapsed) {
    closeSelection()
  } else {
    captureSelection()
  }
}
function outsidePointer(event: PointerEvent): void {
  const target = event.target instanceof Element ? event.target : undefined
  if (target?.closest('.selection-bubble, .color-capsule, .el-color-picker__panel')) {
    return
  }
  if (target && root.value?.contains(target)) {
    return
  }
  closeSelection()
}
function keydown(event: KeyboardEvent): void {
  if (event.key === 'Escape') {
    closeSelection()
  }
}
function applyColor(color: string): void {
  emit('color', color)
  bubbleOpen.value = false
}
function clearColor(): void {
  emit('clear')
  bubbleOpen.value = false
}
watch(() => [props.html, props.revision, props.mode, props.focus, props.disabled], closeSelection)
onMounted(function listen() {
  document.addEventListener('selectionchange', changedSelection)
  document.addEventListener('pointerdown', outsidePointer)
  document.addEventListener('keydown', keydown)
  observer = new ResizeObserver(function measure() {
    if (paper.value) {
      measuredWidth.value = Math.round(paper.value.clientWidth)
    }
    closeSelection()
  })
  if (paper.value) {
    observer.observe(paper.value)
  }
})
onBeforeUnmount(function unlisten() {
  observer?.disconnect()
  document.removeEventListener('selectionchange', changedSelection)
  document.removeEventListener('pointerdown', outsidePointer)
  document.removeEventListener('keydown', keydown)
})
defineExpose({ captureSelection })
</script>
<template>
  <section ref="pane" class="preview-pane">
    <div class="preview-heading">
      <span>排版预览</span>
      <div class="preview-actions">
        <el-radio-group
          :model-value="mode"
          size="small"
          :disabled="disabled"
          aria-label="预览宽度"
          @update:model-value="emit('mode', $event as 'phone' | 'desktop')"
          ><el-radio-button value="phone">手机</el-radio-button
          ><el-radio-button value="desktop">电脑</el-radio-button></el-radio-group
        ><button
          class="ui-button"
          :disabled="disabled"
          :aria-pressed="focus"
          @click="emit('focus')"
        >
          {{ focus ? '返回编辑' : '专注预览' }}
        </button>
      </div>
    </div>
    <div class="preview-scroll" @scroll="closeSelection">
      <div class="canvas-controls">
        <span>{{ measuredWidth }}px 阅读画板</span
        ><label
          ><input v-model="showFrame" type="checkbox" @change="closeSelection" />阅读外壳</label
        >
      </div>
      <div ref="paper" class="paper" :class="[mode, { 'without-frame': !showFrame }]">
        <template v-if="showFrame">
          <div v-if="mode === 'phone'" class="phone-status" aria-hidden="true">
            <span>9:41</span><i class="island" /><span>5G ▰</span>
          </div>
          <div class="reader-nav" aria-hidden="true">
            <span>{{ mode === 'phone' ? '‹' : '←' }}</span
            ><span>{{ mode === 'phone' ? '微信文章' : '微信 · 电脑阅读' }}</span
            ><span>···</span>
          </div>
          <div class="reader-meta">
            <span class="original">原创</span><span class="account">公众号名称</span
            ><small>模拟阅读信息</small>
          </div>
        </template>
        <article
          ref="root"
          title="选中文字可局部改色"
          @pointerup="selectionFinished"
          @keyup="selectionFinished"
          v-html="html"
        />
      </div>
      <p class="paper-note">阅读外壳不进入复制内容 · 实际效果以公众号保存后为准</p>
    </div>
    <div
      v-if="bubbleOpen"
      ref="bubble"
      class="selection-bubble"
      :style="bubblePosition"
      role="toolbar"
      aria-label="选中文字颜色"
      @pointerdown.prevent
    >
      <span>字色</span
      ><button
        v-for="color in quickColors"
        :key="color"
        class="color-dot"
        :style="{ '--swatch': color }"
        :aria-label="`设置字色 ${color}`"
        :disabled="disabled"
        @click="applyColor(color)"
      />
      <ColorPicker
        :color="localColor"
        label="自定义字色"
        compact
        :disabled="disabled"
        @change="applyColor"
      />
      <button class="ui-button" :disabled="disabled" @click="clearColor">清除</button>
    </div>
  </section>
</template>
<style scoped>
.preview-pane {
  position: relative;
  border-left: 1px solid var(--ui-border);
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  min-height: 0;
  background: var(--ui-bg);
}
.preview-heading {
  height: 48px;
  padding: 0 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--ui-surface);
  border-bottom: 1px solid var(--ui-border);
  color: var(--ui-text);
  font-size: 13px;
}
.preview-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.preview-actions :deep(.el-radio-button__inner) {
  padding: 6px 10px;
}
.preview-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 20px 18px 16px;
}
.canvas-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 18px;
  color: var(--ui-muted);
  font-size: 12px;
  margin-bottom: 16px;
}
.canvas-controls label {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
}
.paper {
  margin: 0 auto;
  background: #fff;
  box-shadow: var(--ui-shadow);
  border: 1px solid var(--ui-border);
  overflow: hidden;
}
.paper.phone {
  width: 375px;
  max-width: 100%;
  border-radius: 24px;
}
.paper.desktop {
  width: 760px;
  max-width: 100%;
  border-radius: var(--ui-radius-lg);
}
.paper.without-frame {
  border-radius: var(--ui-radius);
}
.phone-status {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 38px;
  padding: 0 20px;
  font-size: 12px;
  color: #1e293b;
}
.island {
  width: 66px;
  height: 17px;
  border-radius: 20px;
  background: #17212f;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}
.reader-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 20px;
  background: #fafafa;
  border-bottom: 1px solid #f1f5f9;
  font-size: 13px;
  color: #334155;
}
.reader-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 24px 24px 0;
  font-size: 12px;
  color: #64748b;
}
.original {
  border: 1px solid #e2e8f0;
  padding: 1px 4px;
  border-radius: 3px;
}
.account {
  color: #576b95;
}
.reader-meta small {
  font-size: 11px;
}
article {
  padding: 4px 24px 28px;
  min-height: 480px;
}
.without-frame article {
  padding-top: 24px;
}
.desktop article {
  padding: 4px 36px 36px;
}
.desktop .reader-meta {
  padding-left: 36px;
}
.desktop.without-frame article {
  padding-top: 24px;
}
.paper-note {
  text-align: center;
  color: var(--ui-muted);
  font-size: 12px;
  line-height: 1.8;
  margin: 18px 0 6px;
}
.selection-bubble {
  position: absolute;
  z-index: 4;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 6px 8px;
  background: var(--ui-surface);
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  box-shadow: var(--ui-shadow-float);
  white-space: nowrap;
}
.selection-bubble > span {
  color: var(--ui-muted);
  font-size: 12px;
  margin-right: 3px;
}
.color-dot {
  display: grid;
  place-items: center;
  width: 26px;
  height: 30px;
  padding: 4px;
  border: 0;
  border-radius: var(--ui-radius-sm);
  background: transparent;
}
.color-dot::after {
  content: '';
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--swatch);
}
.color-dot:hover {
  background: var(--ui-hover);
}
article :deep(::selection) {
  background: #dbeafe;
}
@media (prefers-reduced-motion: no-preference) {
  .selection-bubble {
    animation: appear 0.15s ease-out;
  }
  @keyframes appear {
    from {
      opacity: 0;
      transform: translateY(3px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
</style>
