<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useWorkspaceStore } from './workspace.store'
import { clampRatio, downloadText, splitBounds } from './workspace.service'
import WorkspaceToolbar from './workspace-toolbar.vue'
import ArticleEditor from '../article/article-editor.vue'
import ArticlePreview from '../article/article-preview.vue'
import TypesettingPanel from '../typesetting/typesetting-panel.vue'
import EndingPanel from '../ending/ending-panel.vue'
import type { TextSelection } from '../article/article.model'
import { maxMarkdownLength } from '../../app.config'

const store = useWorkspaceStore()
const split = ref<HTMLElement>()
const fileInput = ref<HTMLInputElement>()
const imageInput = ref<HTMLInputElement>()
const selection = ref<TextSelection>()
const containerWidth = ref(900)
const cursor = ref({ start: 0, end: 0 })
const dragging = ref(false)
let observer: ResizeObserver | undefined
const displayedRatio = computed(() => clampRatio(store.ratio, containerWidth.value))
const gridStyle = computed(() =>
  store.focus
    ? { gridTemplateColumns: '1fr' }
    : {
        gridTemplateColumns: `minmax(280px, ${displayedRatio.value}fr) 12px minmax(320px, ${1 - displayedRatio.value}fr)`,
      },
)
const drawerTitle = computed(
  () => ({ text: '文字设置', colors: '配色实验室', ending: '固定结尾' })[store.drawer || 'text'],
)
function updatePointer(event: PointerEvent): void {
  if (!split.value || !dragging.value) {
    return
  }
  const rect = split.value.getBoundingClientRect()
  store.ratio = clampRatio((event.clientX - rect.left) / (rect.width - 12), rect.width)
}
function startDrag(event: PointerEvent): void {
  dragging.value = true
  ;(event.currentTarget as HTMLElement).setPointerCapture(event.pointerId)
  updatePointer(event)
}
function stopDrag(): void {
  dragging.value = false
}
function keyRatio(event: KeyboardEvent): void {
  if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
    return
  }
  event.preventDefault()
  const bounds = splitBounds(containerWidth.value)
  store.ratio =
    event.key === 'Home'
      ? bounds.min
      : event.key === 'End'
        ? bounds.max
        : clampRatio(
            displayedRatio.value + (event.key === 'ArrowLeft' ? -0.02 : 0.02),
            containerWidth.value,
          )
}
async function importFile(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  try {
    if (!/\.(md|txt)$/i.test(file.name) || file.size > 2 * 1024 * 1024) {
      throw new Error('请选择不超过 2 MB 的单个 .md 或 .txt 文件。')
    }
    if (!window.confirm('导入将替换当前正文。需要保留时，请先下载 Markdown。')) {
      return
    }
    const revision = store.article.revision
    const markdown = new TextDecoder('utf-8', { fatal: true })
      .decode(await file.arrayBuffer())
      .replace(/^\uFEFF/, '')
    if (markdown.length > maxMarkdownLength) {
      throw new Error('文章超过 50 万字符，请拆分后导入。')
    }
    if (revision !== store.article.revision) {
      throw new Error('读取文件期间正文已修改，请重新导入。')
    }
    store.updateMarkdown(markdown)
    selection.value = undefined
    cursor.value = { start: 0, end: 0 }
    store.message = `已导入 ${file.name}`
  } catch (error) {
    store.message = error instanceof Error ? error.message : '文件无法读取，请使用 UTF-8 编码。'
  }
}
async function importImage(event: Event): Promise<void> {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) {
    return
  }
  try {
    await store.insertImage(file, cursor.value.start, cursor.value.end)
  } catch (error) {
    store.message = error instanceof Error ? error.message : '图片无法处理。'
  }
}
function copy(): void {
  if (store.copyState === 'ready') {
    void store.copyPrepared()
  } else {
    void store.prepareCopy()
  }
}
function beforeUnload(event: BeforeUnloadEvent): void {
  if (store.dirty) {
    event.preventDefault()
    event.returnValue = ''
    void store.saveNow()
  }
}
function pageHidden(): void {
  if (document.hidden && store.dirty) {
    void store.saveNow()
  }
}
onMounted(function initialize() {
  void store.initialize()
  observer = new ResizeObserver(function measure(entries) {
    containerWidth.value = entries[0].contentRect.width
  })
  if (split.value) {
    observer.observe(split.value)
  }
  window.addEventListener('blur', stopDrag)
  window.addEventListener('beforeunload', beforeUnload)
  document.addEventListener('visibilitychange', pageHidden)
})
onBeforeUnmount(function cleanup() {
  observer?.disconnect()
  window.removeEventListener('blur', stopDrag)
  window.removeEventListener('beforeunload', beforeUnload)
  document.removeEventListener('visibilitychange', pageHidden)
  store.dispose()
})
</script>

<template>
  <main class="workbench">
    <WorkspaceToolbar
      :config="store.config"
      :drawer="store.drawer"
      :focus="store.focus"
      :mode="store.previewMode"
      :copy-state="store.copyState"
      :disabled="!store.ready"
      @config="store.setConfig"
      @local-color="store.colorSelection(selection, $event)"
      @drawer="store.toggleDrawer"
      @import="fileInput?.click()"
      @image="imageInput?.click()"
      @download="downloadText(store.article.markdown, '桀士排版.md')"
      @focus="store.focus = !store.focus"
      @mode="store.previewMode = store.previewMode === 'phone' ? 'desktop' : 'phone'"
      @copy="copy"
    />
    <input
      ref="fileInput"
      class="hidden-input"
      type="file"
      accept=".md,.txt"
      @change="importFile"
    />
    <input
      ref="imageInput"
      class="hidden-input"
      type="file"
      accept="image/png,image/jpeg,image/gif,image/webp"
      @change="importImage"
    />
    <div class="content-row">
      <aside v-if="store.drawer" class="drawer" aria-label="排版设置">
        <div class="drawer-heading">
          <div>
            <small>TYPE & STYLE</small>
            <h2>{{ drawerTitle }}</h2>
          </div>
          <button aria-label="关闭设置" @click="store.drawer = undefined">×</button>
        </div>
        <TypesettingPanel
          v-if="store.drawer !== 'ending'"
          :kind="store.drawer"
          :config="store.config"
          @change="store.setConfig"
          @preset="store.choosePreset"
        />
        <EndingPanel
          v-else
          :ending="store.ending"
          :save-state="store.saveState"
          @change="store.ending = { ...store.ending, ...$event }"
          @save="store.saveNow"
        />
      </aside>
      <div ref="split" class="split-workspace" :style="gridStyle">
        <ArticleEditor
          v-if="!store.focus"
          :markdown="store.article.markdown"
          :disabled="!store.ready"
          @change="store.updateMarkdown"
          @cursor="(start, end) => (cursor = { start, end })"
        />
        <div
          v-if="!store.focus"
          class="separator"
          :class="{ dragging }"
          role="separator"
          tabindex="0"
          aria-label="调整编辑与预览比例"
          aria-orientation="vertical"
          :aria-valuenow="Math.round(displayedRatio * 100)"
          :aria-valuemin="Math.round(splitBounds(containerWidth).min * 100)"
          :aria-valuemax="Math.round(splitBounds(containerWidth).max * 100)"
          @pointerdown="startDrag"
          @pointermove="updatePointer"
          @pointerup="stopDrag"
          @pointercancel="stopDrag"
          @lostpointercapture="stopDrag"
          @keydown="keyRatio"
        >
          <span />
        </div>
        <ArticlePreview
          :html="store.preview.html"
          :revision="store.article.revision"
          :mode="store.previewMode"
          @selection="selection = $event"
          @error="store.message = $event"
        />
      </div>
    </div>
    <div
      v-if="
        store.message ||
        store.invalidAnnotations ||
        store.preview.diagnostics.length ||
        store.diagnostics.length
      "
      class="messages"
      aria-live="polite"
    >
      <div v-if="store.message" class="message">
        <span>{{ store.message }}</span
        ><button aria-label="关闭提示" @click="store.message = ''">×</button>
      </div>
      <div v-if="store.invalidAnnotations" class="message warning">
        <span>{{ store.invalidAnnotations }} 处局部颜色因改稿失效，请重新选择文字设置。</span
        ><button
          @click="store.article.annotations = store.article.annotations.filter((a) => !a.invalid)"
        >
          清除失效标注
        </button>
      </div>
      <p
        v-for="(diagnostic, index) in [...store.preview.diagnostics, ...store.diagnostics]"
        :key="index"
        :class="{ warning: diagnostic.level === 'error' }"
      >
        {{ diagnostic.message }}
      </p>
    </div>
    <footer class="status-bar">
      <span
        ><i :class="{ failed: store.saveBlocked || store.saveState.startsWith('保存失败') }" />{{
          store.saveState
        }}
        <button v-if="!store.saveBlocked && store.ready" @click="store.saveNow">
          立即保存
        </button></span
      ><span>本地草稿 · 横屏工作台 <span class="status-dot">/</span> JLab WeChat Editor</span>
    </footer>
  </main>
</template>

<style>
:root {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Microsoft YaHei', sans-serif;
  --el-color-primary: #7952b5;
  --el-color-primary-light-3: #a88ccf;
  --el-color-primary-light-5: #c5b2e0;
  --el-color-primary-light-7: #ded3ed;
  --el-color-primary-light-9: #f4eefb;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  background: #f8f6fc;
  min-width: 1280px;
}
button,
input,
textarea {
  font-family: inherit;
}
button:focus-visible,
input:focus-visible,
[tabindex]:focus-visible {
  outline: 2px solid #9972ce;
  outline-offset: 2px;
}
.workbench {
  display: flex;
  flex-direction: column;
  min-width: 1280px;
  height: 100vh;
  min-height: 650px;
}
.hidden-input {
  display: none;
}
.content-row {
  display: flex;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.drawer {
  flex: 0 0 300px;
  background: #fff;
  border-right: 1px solid #e7dfef;
  overflow: auto;
  animation: reveal 160ms ease-out;
}
@keyframes reveal {
  from {
    opacity: 0;
    transform: translateX(-14px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
.drawer-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22px;
  border-bottom: 1px solid #eee9f4;
}
.drawer-heading small {
  color: #baa8cd;
  font-size: 9px;
  letter-spacing: 1.8px;
}
.drawer-heading h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 7px 0 0;
  color: #5e426f;
}
.drawer-heading button {
  border: none;
  background: #f5f1fa;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  cursor: pointer;
  color: #9d85b2;
  font-size: 18px;
}
.split-workspace {
  flex: 1;
  min-width: 612px;
  display: grid;
  overflow: hidden;
}
.separator {
  cursor: col-resize;
  touch-action: none;
  user-select: none;
  display: grid;
  place-items: center;
  background: #f9f7fc;
  border-left: 1px solid #e8e3ef;
  border-right: 1px solid #e8e3ef;
}
.separator span {
  height: 36px;
  width: 3px;
  border-radius: 2px;
  background: #c6bbd5;
}
.separator:hover,
.separator.dragging {
  background: #eee5f9;
}
.messages {
  flex-shrink: 0;
  max-height: 140px;
  overflow: auto;
  padding: 8px 24px;
  background: #faf7ff;
  border-top: 1px solid #e5d9f5;
  font-size: 12px;
  color: #7b6396;
}
.message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}
.messages p {
  margin: 5px 0;
  line-height: 1.6;
}
.message button {
  border: 0;
  background: none;
  color: #9476b5;
  cursor: pointer;
  font-size: 11px;
}
.warning {
  color: #a46836;
}
.status-bar {
  height: 35px;
  flex-shrink: 0;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border-top: 1px solid #e9e3f0;
  font-size: 10px;
  color: #a393b0;
}
.status-bar i {
  display: inline-block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #81ab91;
  margin-right: 7px;
  vertical-align: middle;
}
.status-bar i.failed {
  background: #c9804c;
}
.status-bar button {
  color: #9177aa;
  border: 0;
  background: none;
  margin-left: 9px;
  cursor: pointer;
  font-size: 10px;
}
.status-dot {
  padding: 0 12px;
  color: #d1c5dc;
}
</style>
