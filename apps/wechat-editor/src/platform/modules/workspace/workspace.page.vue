<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useWorkspaceStore } from './workspace.store'
import { clampRatio, splitBounds } from './workspace.service'
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
const selection = ref<TextSelection>()
const containerWidth = ref(900)
const dragging = ref(false)
let observer: ResizeObserver | undefined
const displayedRatio = computed(() => clampRatio(store.ratio, containerWidth.value))
const gridStyle = computed(() =>
  store.focus
    ? { gridTemplateColumns: '1fr' }
    : {
        gridTemplateColumns: `minmax(280px, ${displayedRatio.value}fr) minmax(320px, ${1 - displayedRatio.value}fr)`,
      },
)
const drawerTitle = computed(
  () =>
    ({ text: '文字设置', colors: '配色', ending: '固定结尾', chapters: '章节样式' })[
      store.drawer || 'text'
    ],
)
function updatePointer(event: PointerEvent): void {
  if (!split.value || !dragging.value) {
    return
  }
  const rect = split.value.getBoundingClientRect()
  store.ratio = clampRatio((event.clientX - rect.left) / rect.width, rect.width)
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
    if (!window.confirm('导入将替换当前正文。需要保留时，请先复制原稿到本地文件。')) {
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
    store.message = `已导入 ${file.name}`
  } catch (error) {
    store.message = error instanceof Error ? error.message : '文件无法读取，请使用 UTF-8 编码。'
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
      :copy-state="store.copyState"
      :disabled="!store.ready"
      @config="store.setConfig"
      @local-color="store.colorSelection(selection, $event)"
      @drawer="store.toggleDrawer"
      @copy="copy"
    />
    <input
      ref="fileInput"
      class="hidden-input"
      type="file"
      accept=".md,.txt"
      @change="importFile"
    />
    <el-drawer
      :model-value="Boolean(store.drawer)"
      :title="drawerTitle"
      direction="ltr"
      size="300px"
      :modal="false"
      :modal-penetrable="true"
      :lock-scroll="false"
      class="settings-drawer"
      @update:model-value="!$event && (store.drawer = undefined)"
    >
      <TypesettingPanel
        v-if="store.drawer && store.drawer !== 'ending'"
        :kind="store.drawer"
        :config="store.config"
        @change="store.setConfig"
        @preset="store.choosePreset"
      />
      <EndingPanel
        v-else-if="store.drawer === 'ending'"
        :ending="store.ending"
        :save-state="store.saveState"
        @change="store.ending = { ...store.ending, ...$event }"
        @save="store.saveNow"
      />
    </el-drawer>
    <div class="content-row">
      <div ref="split" class="split-workspace" :style="gridStyle">
        <ArticleEditor
          v-if="!store.focus"
          :markdown="store.article.markdown"
          :disabled="!store.ready"
          @change="store.updateMarkdown"
          @import="fileInput?.click()"
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
          <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true">
            <path
              d="M4 5v10M8 5v10"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <ArticlePreview
          :html="store.preview.html"
          :revision="store.article.revision"
          :mode="store.previewMode"
          :focus="store.focus"
          :disabled="!store.ready"
          @mode="store.previewMode = $event"
          @focus="store.focus = !store.focus"
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
.settings-drawer {
  top: 76px !important;
  height: calc(100% - 76px) !important;
}
.settings-drawer .el-drawer__header {
  margin-bottom: 0;
  padding: 22px;
  border-bottom: 1px solid #eee9f4;
  color: #5e426f;
}
.settings-drawer .el-drawer__body {
  padding: 0;
}
.split-workspace {
  position: relative;
  flex: 1;
  min-width: 600px;
  display: grid;
  overflow: hidden;
}
.separator {
  position: absolute;
  left: v-bind('displayedRatio * 100 + "%"');
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 12px;
  height: 32px;
  cursor: col-resize;
  touch-action: none;
  user-select: none;
  display: grid;
  place-items: center;
  color: #a697bb;
  border-radius: 4px;
}
.separator:hover,
.separator.dragging {
  color: #7952b5;
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
