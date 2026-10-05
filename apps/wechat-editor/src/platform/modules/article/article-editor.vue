<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ markdown: string; disabled: boolean }>()
const emit = defineEmits<{ change: [value: string]; import: [] }>()
const input = ref<HTMLTextAreaElement>()
let composing = false
function update(event: Event): void {
  if (!composing) {
    emit('change', (event.target as HTMLTextAreaElement).value)
  }
}
function compositionEnd(event: CompositionEvent): void {
  composing = false
  update(event)
}
function tab(event: KeyboardEvent): void {
  if (event.key !== 'Tab' || !input.value || composing) {
    return
  }
  event.preventDefault()
  if (
    input.value.value.length - (input.value.selectionEnd - input.value.selectionStart) + 2 >
    500000
  ) {
    return
  }
  input.value.setRangeText('  ', input.value.selectionStart, input.value.selectionEnd, 'end')
  emit('change', input.value.value)
}
</script>

<template>
  <section class="editor-pane">
    <div class="pane-heading">
      <span class="pane-label">MARKDOWN</span><span>原稿</span
      ><el-button
        size="small"
        text
        :disabled="disabled"
        title="导入单个 Markdown / TXT"
        @click="emit('import')"
        >导入</el-button
      >
    </div>
    <textarea
      ref="input"
      :value="markdown"
      :disabled="disabled"
      aria-label="Markdown 原稿"
      spellcheck="false"
      maxlength="500000"
      placeholder="从这里开始写作…"
      @input="update"
      @compositionstart="composing = true"
      @compositionend="compositionEnd"
      @keydown="tab"
    />
    <div class="editor-footer">
      <span>{{ markdown.length.toLocaleString() }} 字符</span><span>Markdown / TXT · 本地写作</span>
    </div>
  </section>
</template>

<style scoped>
.editor-pane {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-width: 0;
  background: #fcfcfe;
}
.pane-heading {
  height: 52px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #ececf3;
  color: #878595;
  font-size: 12px;
}
.pane-label {
  font-size: 11px;
  letter-spacing: 1.6px;
  font-weight: 700;
  color: #61547e;
}
textarea {
  flex: 1;
  width: 100%;
  resize: none;
  border: 0;
  outline: none;
  padding: 24px 28px;
  background: transparent;
  color: #4b4957;
  font:
    14px/1.85 'Cascadia Code',
    Consolas,
    'Microsoft YaHei',
    monospace;
  tab-size: 2;
}
textarea::placeholder {
  color: #aaa6b6;
}
.editor-footer {
  display: flex;
  justify-content: space-between;
  padding: 11px 24px;
  border-top: 1px solid #ececf3;
  font-size: 11px;
  color: #94909f;
}
</style>
