<script setup lang="ts">
import type { TypesettingConfig } from '../typesetting/typesetting.model'
defineProps<{
  config: TypesettingConfig
  drawer?: string
  copyState: string
  disabled: boolean
  saveState: string
  saveBlocked: boolean
}>()
const emit = defineEmits<{
  config: [patch: Partial<TypesettingConfig>]
  localColor: [color: string]
  drawer: [kind: 'text' | 'colors' | 'ending' | 'chapters']
  copy: []
}>()
</script>

<template>
  <header class="toolbar">
    <div class="brand">
      <span class="brand-mark">J.</span>
      <div><strong>桀士排版</strong><small>JLAB WECHAT EDITOR</small></div>
    </div>
    <div class="toolbar-divider" />
    <label class="quick-color"
      >正文色<input
        type="color"
        :value="config.colors.body"
        aria-label="正文颜色"
        :disabled="disabled"
        @input="
          emit('config', {
            colors: { ...config.colors, body: ($event.target as HTMLInputElement).value },
          })
        "
    /></label>
    <label class="quick-color"
      >局部字色<input
        type="color"
        value="#c44b77"
        aria-label="局部文字颜色"
        :disabled="disabled"
        @change="emit('localColor', ($event.target as HTMLInputElement).value)"
    /></label>
    <button
      class="tool-button"
      :class="{ active: drawer === 'chapters' }"
      :disabled="disabled"
      @click="emit('drawer', 'chapters')"
    >
      章节样式
    </button>
    <div class="toolbar-divider" />
    <button
      class="tool-button"
      :class="{ active: drawer === 'text' }"
      :disabled="disabled"
      @click="emit('drawer', 'text')"
    >
      文字设置
    </button>
    <button
      class="tool-button"
      :class="{ active: drawer === 'colors' }"
      :disabled="disabled"
      @click="emit('drawer', 'colors')"
    >
      配色
    </button>
    <button
      class="tool-button"
      :class="{ active: drawer === 'ending' }"
      :disabled="disabled"
      @click="emit('drawer', 'ending')"
    >
      固定结尾
    </button>
    <div class="toolbar-spacer" />
    <span
      class="save-status"
      :class="{ failed: saveBlocked || saveState.startsWith('保存失败') }"
      :title="saveState"
      role="status"
    >
      <i aria-hidden="true" />自动保存 · {{ saveState }}
    </span>
    <el-button
      class="copy-button"
      type="primary"
      :disabled="disabled"
      :loading="copyState === 'preparing' || copyState === 'copying'"
      @click="emit('copy')"
      >{{
        copyState === 'preparing'
          ? '准备图文'
          : copyState === 'ready'
            ? '复制已准备内容'
            : copyState === 'success'
              ? '已复制 ✓'
              : '复制到公众号'
      }}</el-button
    >
  </header>
</template>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  height: 76px;
  gap: 9px;
  padding: 0 20px;
  background: #fff;
  border-bottom: 1px solid #e6e0ef;
  flex-shrink: 0;
  white-space: nowrap;
}
.brand {
  display: flex;
  align-items: center;
  gap: 9px;
  margin-right: 8px;
}
.brand-mark {
  display: grid;
  place-items: center;
  width: 33px;
  height: 36px;
  border-radius: 10px;
  background: #6e45ab;
  color: #fff;
  font:
    italic 700 24px Georgia,
    serif;
  box-shadow: 0 3px 10px #6e45ab25;
}
.brand strong {
  display: block;
  font-size: 16px;
  letter-spacing: 1px;
  color: #453050;
}
.brand small {
  display: block;
  font-size: 7px;
  letter-spacing: 1px;
  color: #ad9cbb;
  margin-top: 5px;
}
.toolbar-divider {
  width: 1px;
  height: 24px;
  background: #eae4f0;
  margin: 0 3px;
}
.quick-color {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #786b83;
  cursor: pointer;
}
.quick-color input {
  width: 22px;
  height: 24px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
}
.tool-button {
  border: none;
  background: transparent;
  color: #756582;
  font: inherit;
  font-size: 11px;
  padding: 9px 6px;
  border-radius: 6px;
  cursor: pointer;
}
.tool-button:hover {
  background: #f5f0fa;
  color: #7348a8;
}
.active {
  background: #f0e8fa;
  color: #7348a8;
}
.toolbar-spacer {
  flex: 1;
  min-width: 0;
}
.copy-button {
  margin: 0 0 0 3px;
  font-size: 11px;
  padding: 8px 12px;
}
.save-status {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: #84758f;
}
.save-status i {
  display: inline-block;
  width: 5px;
  height: 5px;
  margin-right: 7px;
  border-radius: 50%;
  background: #81ab91;
  vertical-align: middle;
}
.save-status.failed {
  color: #a46836;
}
.save-status.failed i {
  background: #c9804c;
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}
</style>
