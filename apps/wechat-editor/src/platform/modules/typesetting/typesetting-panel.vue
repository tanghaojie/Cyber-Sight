<script setup lang="ts">
import { contrastRatio, presets } from './typesetting.service'
import { chapterStyles, type TypesettingConfig, type ColorRole } from './typesetting.model'
const props = defineProps<{ kind: 'text' | 'colors' | 'chapters'; config: TypesettingConfig }>()
const emit = defineEmits<{ change: [patch: Partial<TypesettingConfig>]; preset: [id: string] }>()
const roles: [ColorRole, string][] = [
  ['body', '正文'],
  ['heading', '标题'],
  ['accent', '强调与装饰'],
  ['muted', '引用'],
  ['background', '底色'],
]
function changeColor(role: ColorRole, event: Event): void {
  emit('change', {
    preset: 'custom',
    colors: { ...props.config.colors, [role]: (event.target as HTMLInputElement).value },
  })
}
</script>

<template>
  <div class="settings-body">
    <template v-if="kind === 'text'">
      <p class="settings-intro">让文字的节奏，适合你的内容。</p>
      <label class="setting-label"
        >字号 <span>{{ config.fontSize }} px</span></label
      >
      <el-slider
        :model-value="config.fontSize"
        :min="14"
        :max="18"
        :step="1"
        @update:model-value="emit('change', { fontSize: Number($event) })"
      />
      <label class="setting-label"
        >行距 <span>{{ config.lineHeight.toFixed(1) }}</span></label
      >
      <el-slider
        :model-value="config.lineHeight"
        :min="1.6"
        :max="2.2"
        :step="0.1"
        @update:model-value="emit('change', { lineHeight: Number($event) })"
      />
      <label class="setting-label"
        >段落间距 <span>{{ config.paragraphGap }} px</span></label
      >
      <el-slider
        :model-value="config.paragraphGap"
        :min="8"
        :max="40"
        :step="2"
        @update:model-value="emit('change', { paragraphGap: Number($event) })"
      />
      <label class="setting-label"
        >字间距 <span>{{ config.letterSpacing }} px</span></label
      >
      <el-slider
        :model-value="config.letterSpacing"
        :min="0"
        :max="3"
        :step="0.1"
        @update:model-value="emit('change', { letterSpacing: Number($event) })"
      />
      <label class="setting-label">字体</label>
      <el-select :model-value="config.font" @update:model-value="emit('change', { font: $event })">
        <el-option label="公众号默认" value="default" /><el-option
          label="黑体 / 无衬线"
          value="sans"
        /><el-option label="宋体 / 衬线" value="serif" />
      </el-select>
      <p class="settings-note">自定义字体取决于设备是否安装。默认选项在复制时沿用公众号字体。</p>
    </template>
    <template v-else-if="kind === 'chapters'">
      <p class="settings-intro">点击选择章节样式，实时查看文章效果。</p>
      <div class="chapter-list" role="group" aria-label="章节样式">
        <button
          v-for="[id, name] in chapterStyles"
          :key="id"
          class="chapter-option"
          :class="{ active: config.chapterStyle === id }"
          :aria-pressed="config.chapterStyle === id"
          @click="emit('change', { chapterStyle: id })"
        >
          <span>{{ name }}</span
          ><span v-if="config.chapterStyle === id" aria-hidden="true">✓</span>
        </button>
      </div>
    </template>
    <template v-else>
      <p class="settings-intro">选一组配色，再给它一点自己的风格。</p>
      <div class="preset-grid">
        <button
          v-for="preset in presets"
          :key="preset.id"
          class="preset-card"
          :class="{ active: config.preset === preset.id }"
          @click="emit('preset', preset.id)"
        >
          <span class="swatches"
            ><i
              v-for="color in Object.values(preset.colors).slice(0, 4)"
              :key="color"
              :style="{ background: color }"
          /></span>
          <span>{{ preset.name }}</span>
        </button>
      </div>
      <div class="role-list">
        <label v-for="[role, label] in roles" :key="role" class="color-row"
          ><span>{{ label }}</span
          ><span class="color-value">{{ config.colors[role].toUpperCase() }}</span
          ><input
            type="color"
            :value="config.colors[role]"
            :aria-label="label + '颜色'"
            @input="changeColor(role, $event)"
        /></label>
      </div>
      <label class="setting-label"
        >引用底色<el-switch
          :model-value="config.backgroundEnabled"
          @update:model-value="emit('change', { backgroundEnabled: Boolean($event) })"
      /></label>
      <p class="settings-note">
        正文对白色的对比度 {{ contrastRatio(config.colors.body, '#ffffff').toFixed(2) }}:1。低于 4.5
        时建议加深正文色。微信深色模式可能调整颜色。
      </p>
    </template>
  </div>
</template>

<style scoped>
.chapter-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.chapter-option {
  display: flex;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid #e7e2ef;
  border-radius: 8px;
  background: #fff;
  color: #746582;
  cursor: pointer;
  text-align: left;
}
.chapter-option.active {
  border-color: #8061c6;
  background: #f7f3ff;
}
.settings-body {
  padding: 22px;
}
.settings-intro {
  font-size: 12px;
  color: #8c8399;
  line-height: 1.8;
  margin: 0 0 24px;
}
.setting-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #5e556d;
  font-size: 12px;
  margin-top: 20px;
}
.setting-label span {
  color: #9c91ad;
}
.el-select {
  width: 100%;
  margin-top: 12px;
}
.settings-note {
  color: #9a90a5;
  font-size: 11px;
  line-height: 1.8;
  margin: 20px 0;
}
.preset-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.preset-card {
  border: 1px solid #e7e2ef;
  background: #fff;
  border-radius: 9px;
  padding: 14px 10px;
  color: #746582;
  font-size: 11px;
  cursor: pointer;
}
.preset-card.active {
  border-color: #8061c6;
  background: #f7f3ff;
}
.swatches {
  display: flex;
  justify-content: center;
  gap: 4px;
  margin-bottom: 10px;
}
.swatches i {
  width: 18px;
  height: 18px;
  border-radius: 50%;
}
.role-list {
  margin-top: 25px;
}
.color-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 12px 0;
  border-bottom: 1px solid #f0edf5;
  font-size: 12px;
  color: #6f637e;
}
.color-value {
  color: #a298ac;
  font: 10px monospace;
  margin-left: auto;
}
input[type='color'] {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
}
</style>
