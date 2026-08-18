<template>
  <div class="geo-scene-panel">
    <section class="scene-panel__section">
      <div class="scene-panel__heading">
        <span>环境效果</span>
        <button type="button" title="刷新场景状态" @click="controller.refresh">↻</button>
      </div>
      <label v-for="item in toggles" :key="item.key" class="scene-panel__toggle">
        <span>{{ item.label }}</span>
        <input
          type="checkbox"
          :checked="Boolean(controller.state[item.key])"
          @change="controller.toggle(item.key)"
        />
        <i aria-hidden="true" />
      </label>
    </section>

    <section class="scene-panel__section">
      <div class="scene-panel__heading"><span>地球外观</span></div>
      <label class="scene-panel__field">
        <span>底色</span>
        <input
          type="color"
          :value="toHex(controller.state.globeBaseColor)"
          @input="setBaseColor($event)"
        />
      </label>
      <label class="scene-panel__field">
        <span>太阳光晕</span>
        <input
          type="range"
          min="0"
          max="2"
          step="0.05"
          :value="controller.state.sunGlowFactor"
          @input="setNumber('sunGlowFactor', $event)"
        />
      </label>
      <label class="scene-panel__field">
        <span>阴影浓度</span>
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          :value="controller.state.shadowDarkness"
          @input="setNumber('shadowDarkness', $event)"
        />
      </label>
    </section>
  </div>
</template>

<script setup lang="ts">
import type { GeoSceneController } from './scene.controller'
import type { GeoSceneSettings } from '../../tools/scene/scene-settings'

const props = defineProps<{ controller: GeoSceneController }>()

const toggles: readonly { key: keyof GeoSceneSettings; label: string }[] = [
  { key: 'sun', label: '太阳' },
  { key: 'moon', label: '月亮' },
  { key: 'atmosphere', label: '大气层' },
  { key: 'lighting', label: '地球光照' },
  { key: 'skyBox', label: '天空盒' },
  { key: 'shadows', label: '场景阴影' },
  { key: 'depthTestAgainstTerrain', label: '地形深度检测' },
  { key: 'groundAtmosphere', label: '地面大气' },
]

function toHex(color: string): string {
  const match = color.match(/^#([0-9a-f]{6})/i)
  return match ? `#${match[1]}` : '#102132'
}

function setBaseColor(event: Event): void {
  props.controller.set({ globeBaseColor: (event.target as HTMLInputElement).value })
}

function setNumber(key: 'sunGlowFactor' | 'shadowDarkness', event: Event): void {
  const value = Number((event.target as HTMLInputElement).value)
  if (Number.isFinite(value)) {
    props.controller.set({ [key]: value })
  }
}
</script>

<style scoped>
.geo-scene-panel {
  display: grid;
  gap: 18px;
}
.scene-panel__section {
  display: grid;
  gap: 10px;
}
.scene-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--geo-text-soft, #b6c5d2);
  font-size: 11px;
  font-weight: 700;
}
.scene-panel__heading button {
  width: 28px;
  height: 28px;
  border: 0;
  border-radius: 8px;
  color: inherit;
  background: transparent;
  cursor: pointer;
}
.scene-panel__heading button:hover {
  background: var(--geo-surface-hover, #1b2a38);
}
.scene-panel__toggle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 34px;
  color: var(--geo-text, #eff8ff);
  font-size: 10px;
}
.scene-panel__toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}
.scene-panel__toggle i {
  position: relative;
  width: 36px;
  height: 20px;
  border-radius: 16px;
  background: #253747;
  cursor: pointer;
}
.scene-panel__toggle i::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #dce7ee;
  content: '';
  transition: transform 0.16s ease;
}
.scene-panel__toggle input:checked + i {
  background: var(--geo-accent, #45c8ff);
}
.scene-panel__toggle input:checked + i::after {
  transform: translateX(16px);
}
.scene-panel__toggle input:focus-visible + i {
  outline: 2px solid var(--geo-accent, #45c8ff);
  outline-offset: 3px;
}
.scene-panel__field {
  display: grid;
  grid-template-columns: 72px 1fr;
  align-items: center;
  gap: 12px;
  color: var(--geo-text-soft, #b6c5d2);
  font-size: 10px;
}
.scene-panel__field input[type='color'] {
  width: 42px;
  height: 28px;
  padding: 0;
  border: 1px solid var(--geo-line, #263c4e);
  border-radius: 8px;
  background: transparent;
}
.scene-panel__field input[type='range'] {
  width: 100%;
  accent-color: var(--geo-accent, #45c8ff);
}
</style>
