<script setup lang="ts">
import { computed, ref } from 'vue'
import { chapterPreview, contrastRatio, defaultTypesetting } from './typesetting.service'
import {
  chapterStyles,
  type TypesettingConfig,
  type ColorPreset,
  type ColorRole,
} from './typesetting.model'
import ColorPicker from './typesetting-color-picker.vue'
const props = defineProps<{ kind: 'text' | 'colors' | 'chapters'; config: TypesettingConfig }>()
const emit = defineEmits<{ change: [patch: Partial<TypesettingConfig>]; preset: [id: string] }>()
const roles: [ColorRole, string][] = [
  ['body', '正文'],
  ['heading', '标题'],
  ['accent', '强调与装饰'],
  ['muted', '引用'],
  ['background', '底色'],
]
const chapters = computed(() =>
  chapterStyles.map(([id, name]) => ({ id, name, html: chapterPreview(id, props.config) })),
)
const paletteName = ref('')
const builtInPalettes = computed(() => props.config.palettes.filter((p) => !p.custom))
const customPalettes = computed(() => props.config.palettes.filter((p) => p.custom))
function renamePalette(preset: ColorPreset, value: string): void {
  const name = value.trim().slice(0, 30) || preset.name
  if (name) {
    emit('change', {
      palettes: props.config.palettes.map((p) => (p.id === preset.id ? { ...p, name } : p)),
    })
  }
}
function deletePalette(preset: ColorPreset): void {
  if (props.config.palettes.length <= 1) {
    return
  }
  const palettes = props.config.palettes.filter((p) => p.id !== preset.id)
  emit('change', { palettes, ...(props.config.preset === preset.id ? { preset: 'custom' } : {}) })
}
function savePalette(): void {
  const name = paletteName.value.trim().slice(0, 30)
  if (!name || customPalettes.value.length >= 9) {
    return
  }
  const id = 'custom-' + crypto.randomUUID()
  emit('change', {
    palettes: [
      ...props.config.palettes,
      { id, name, colors: { ...props.config.colors }, custom: true },
    ],
    preset: id,
  })
  paletteName.value = ''
}
function changeColor(role: ColorRole, color: string): void {
  emit('change', { preset: 'custom', colors: { ...props.config.colors, [role]: color } })
}
function resetText(): void {
  const d = defaultTypesetting()
  emit('change', {
    fontSize: d.fontSize,
    lineHeight: d.lineHeight,
    paragraphGap: d.paragraphGap,
    letterSpacing: d.letterSpacing,
    font: d.font,
  })
}
</script>
<template>
  <div class="settings-body">
    <template v-if="kind === 'text'">
      <p class="settings-intro">先选常用档位，再细调阅读节奏。</p>
      <label class="setting-label"
        >字号<span>{{ config.fontSize }} px</span></label
      >
      <el-slider
        :model-value="config.fontSize"
        :min="14"
        :max="18"
        :step="1"
        aria-label="字号"
        @update:model-value="emit('change', { fontSize: Number($event) })"
      />
      <div class="quick-values">
        <button
          v-for="size in [14, 15, 16, 17]"
          :key="size"
          class="ui-button bordered"
          :class="{ active: config.fontSize === size }"
          :aria-pressed="config.fontSize === size"
          @click="emit('change', { fontSize: size })"
        >
          {{ size }}
        </button>
      </div>
      <label class="setting-label"
        >行距<span>{{ config.lineHeight.toFixed(1) }}</span></label
      >
      <el-slider
        :model-value="config.lineHeight"
        :min="1.6"
        :max="2.2"
        :step="0.1"
        aria-label="行距"
        @update:model-value="emit('change', { lineHeight: Number($event) })"
      />
      <div class="quick-values">
        <button
          v-for="[value, label] in [
            [1.6, '紧凑'],
            [1.9, '推荐'],
            [2.2, '宽松'],
          ] as const"
          :key="value"
          class="ui-button bordered"
          :class="{ active: config.lineHeight === value }"
          :aria-pressed="config.lineHeight === value"
          @click="emit('change', { lineHeight: value })"
        >
          {{ value }} {{ label }}
        </button>
      </div>
      <label class="setting-label"
        >段落间距<span>{{ config.paragraphGap }} px</span></label
      ><el-slider
        :model-value="config.paragraphGap"
        :min="8"
        :max="40"
        :step="2"
        aria-label="段落间距"
        @update:model-value="emit('change', { paragraphGap: Number($event) })"
      />
      <label class="setting-label"
        >字间距<span>{{ config.letterSpacing }} px</span></label
      ><el-slider
        :model-value="config.letterSpacing"
        :min="0"
        :max="3"
        :step="0.1"
        aria-label="字间距"
        @update:model-value="emit('change', { letterSpacing: Number($event) })"
      />
      <label class="setting-label">字体</label
      ><el-select
        :model-value="config.font"
        aria-label="字体"
        @update:model-value="emit('change', { font: $event })"
        ><el-option label="公众号默认" value="default" /><el-option
          label="黑体 / 无衬线"
          value="sans" /><el-option label="宋体 / 衬线" value="serif"
      /></el-select>
      <p class="settings-note">自定义字体取决于设备。默认选项在复制时沿用公众号字体。</p>
      <button class="ui-button bordered" @click="resetText">恢复默认文字设置</button>
    </template>
    <template v-else-if="kind === 'chapters'">
      <label class="setting-label chapter-number">
        启用章节序号
        <el-switch
          :model-value="config.chapterNumberEnabled"
          @update:model-value="emit('change', { chapterNumberEnabled: Boolean($event) })"
        />
      </label>
      <p class="settings-intro">序号按正文章节顺序自动添加；下方样式只控制标题装饰。</p>
      <div class="chapter-list" role="group" aria-label="章节样式">
        <button
          v-for="item in chapters"
          :key="item.id"
          class="chapter-option"
          :class="{ active: config.chapterStyle === item.id }"
          :aria-pressed="config.chapterStyle === item.id"
          @click="emit('change', { chapterStyle: item.id })"
        >
          <span class="chapter-preview" v-html="item.html" /><span class="chapter-label"
            ><span>{{ item.name }}</span
            ><span v-if="config.chapterStyle === item.id">✓ 已选</span></span
          >
        </button>
      </div>
    </template>
    <template v-else>
      <p class="settings-intro">看看标题、正文与引用如何相处。</p>
      <section
        v-for="group in [
          { label: '默认配色', items: builtInPalettes },
          { label: '用户自定义配色', items: customPalettes },
        ]"
        :key="group.label"
      >
        <h3 class="palette-heading">
          {{ group.label }}
          <small v-if="group.label === '用户自定义配色'">{{ customPalettes.length }}/9</small>
        </h3>
        <div class="preset-grid">
          <div v-for="preset in group.items" :key="preset.id" class="palette-entry">
            <button
              class="preset-card"
              :class="{ active: config.preset === preset.id }"
              :aria-pressed="config.preset === preset.id"
              @click="emit('preset', preset.id)"
            >
              <span class="mini-article" :style="{ color: preset.colors.body }"
                ><strong
                  :style="{ color: preset.colors.heading, borderColor: preset.colors.accent }"
                  >阅读的节奏</strong
                ><span class="mini-line" /><span class="mini-line short" /><span
                  class="mini-quote"
                  :style="{
                    color: preset.colors.muted,
                    background: preset.colors.background,
                    borderColor: preset.colors.accent,
                  }"
                  >给观点一点留白</span
                ></span
              ><span class="preset-name"
                >{{ preset.name }}<span v-if="config.preset === preset.id"> ✓</span></span
              >
            </button>
            <div class="palette-actions">
              <input
                :value="preset.name"
                maxlength="30"
                :aria-label="'配色名称：' + preset.name"
                @change="renamePalette(preset, ($event.target as HTMLInputElement).value)"
              />
              <button
                class="ui-button"
                :disabled="config.palettes.length <= 1"
                :aria-label="'删除配色：' + preset.name"
                @click="deletePalette(preset)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </section>
      <div class="palette-save">
        <input
          v-model="paletteName"
          maxlength="30"
          placeholder="输入配色名"
          aria-label="新配色名称"
        />
        <button
          class="ui-button bordered"
          :disabled="!paletteName.trim() || customPalettes.length >= 9"
          @click="savePalette"
        >
          保存当前配色
        </button>
      </div>
      <p class="settings-note">至少保留一个配色。调整下方颜色后可保存为自定义配色，最多九个。</p>
      <div class="role-list">
        <div v-for="[role, label] in roles" :key="role" class="color-row">
          <span>{{ label }}</span
          ><ColorPicker
            :color="config.colors[role]"
            :label="`${label}颜色`"
            @change="changeColor(role, $event)"
          />
        </div>
      </div>
      <label class="setting-label"
        >引用底色<el-switch
          :model-value="config.backgroundEnabled"
          @update:model-value="emit('change', { backgroundEnabled: Boolean($event) })"
      /></label>
      <p class="settings-note">
        正文对白色的对比度
        {{
          contrastRatio(config.colors.body, '#ffffff').toFixed(2)
        }}:1。低于4.5建议加深正文色。微信深色模式可能调整颜色。
      </p>
    </template>
  </div>
</template>
<style scoped>
.settings-body {
  padding: 20px;
}
.settings-intro,
.settings-note {
  color: var(--ui-muted);
  font-size: 12px;
  line-height: 1.8;
  margin: 0 0 20px;
}
.settings-note {
  margin-top: 18px;
}
.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: var(--ui-text);
  font-size: 13px;
  margin-top: 24px;
}
.setting-label span {
  color: var(--ui-primary);
  font-variant-numeric: tabular-nums;
}
.quick-values {
  display: flex;
  gap: 5px;
}
.quick-values button {
  flex: 1;
  font-size: 12px;
  padding: 5px 6px;
}
.el-select {
  width: 100%;
  margin-top: 12px;
}
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chapter-option {
  display: block;
  text-align: left;
  padding: 14px;
  border: 1px solid var(--ui-border);
  border-radius: var(--ui-radius);
  background: var(--ui-surface);
}
.chapter-option:hover,
.preset-card:hover {
  border-color: var(--ui-primary);
}
.chapter-option.active,
.preset-card.active {
  border-color: var(--ui-primary);
  background: var(--ui-active);
}
.chapter-preview {
  display: block;
  margin-bottom: 10px;
}
.chapter-label {
  display: flex;
  justify-content: space-between;
  color: var(--ui-muted);
  font-size: 12px;
}
.chapter-label > span:last-child:not(:first-child) {
  color: var(--ui-primary);
}
.preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.preset-card {
  border: 1px solid var(--ui-border);
  background: var(--ui-surface);
  border-radius: var(--ui-radius);
  padding: 12px 10px;
  text-align: left;
  min-width: 0;
}
.mini-article {
  display: block;
  background: #fff;
  padding: 5px 4px 12px;
}
.mini-article strong {
  display: block;
  border-left: 3px solid;
  padding-left: 7px;
  margin-bottom: 12px;
  font-size: 13px;
}
.mini-line {
  display: block;
  background: currentColor;
  opacity: 0.3;
  height: 3px;
  margin: 8px 0;
  width: 90%;
}
.mini-line.short {
  width: 65%;
}
.mini-quote {
  display: block;
  font-size: 11px;
  padding: 8px 5px;
  margin-top: 12px;
  border-left: 2px solid;
}
.preset-name {
  display: block;
  font-size: 12px;
  color: var(--ui-text);
  margin-top: 6px;
}
.role-list {
  margin-top: 18px;
}
.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  border-bottom: 1px solid var(--ui-border);
  padding: 12px 0;
  font-size: 13px;
}

.chapter-number {
  margin: 0 0 12px;
}
.palette-heading {
  font-size: 13px;
  margin: 20px 0 12px;
}
.palette-heading small {
  color: var(--ui-muted);
  font-weight: normal;
}
.palette-entry {
  min-width: 0;
}
.palette-entry .preset-card {
  width: 100%;
}
.palette-actions,
.palette-save {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-top: 8px;
}
.palette-actions input,
.palette-save input {
  min-width: 0;
  width: 100%;
  border: 1px solid var(--ui-border);
  border-radius: 4px;
  padding: 6px 8px;
  color: var(--ui-text);
  background: var(--ui-surface);
  font-size: 12px;
}
.palette-save {
  margin-top: 20px;
}
</style>
