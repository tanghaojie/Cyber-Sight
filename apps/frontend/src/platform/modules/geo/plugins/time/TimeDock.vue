<template>
  <section
    class="geo-time-dock"
    :class="{
      'geo-time-dock--collapsed': collapsed,
      'geo-time-dock--joined-with-status': joinedWithStatus,
    }"
    :aria-label="t('geo.time.timeline')"
  >
    <div class="geo-time-dock__controls">
      <button
        type="button"
        class="geo-time-dock__play"
        :title="controller.state.playing ? t('geo.time.pause') : t('geo.time.play')"
        :aria-label="controller.state.playing ? t('geo.time.pause') : t('geo.time.play')"
        @click="controller.togglePlayback"
      >
        {{ controller.state.playing ? 'Ⅱ' : '▶' }}
      </button>
      <button
        v-if="!collapsed"
        type="button"
        class="geo-time-dock__now"
        :title="t('geo.time.now')"
        @click="controller.resetToNow"
      >
        {{ t('geo.time.now') }}
      </button>
      <strong>{{ formatCurrentTime(controller.state.currentTime) }}</strong>
      <select
        :value="controller.state.multiplier"
        :aria-label="t('geo.time.speed')"
        @change="setMultiplier"
      >
        <option v-for="speed in speeds" :key="speed" :value="speed">{{ speed }}×</option>
      </select>
    </div>

    <div v-if="!collapsed" class="geo-time-dock__track">
      <span>{{ formatBoundary(controller.state.startTime) }}</span>
      <input
        type="range"
        min="0"
        max="1000"
        step="1"
        :value="progress"
        :aria-label="t('geo.time.scrub')"
        @input="setProgress"
      />
      <span>{{ formatBoundary(controller.state.stopTime) }}</span>
    </div>

    <div v-if="!collapsed" class="geo-time-dock__lighting">
      <label>
        <input type="checkbox" :checked="solarLighting.state.lighting" @change="setLighting" />
        <i aria-hidden="true" />
        <span>{{ t('geo.time.sunlight') }}</span>
      </label>
      <label :title="t('geo.time.shadowCost')">
        <input type="checkbox" :checked="solarLighting.state.shadows" @change="setShadows" />
        <i aria-hidden="true" />
        <span>{{ t('geo.time.shadows') }}</span>
      </label>
    </div>

    <button
      type="button"
      class="geo-time-dock__toggle"
      :title="collapsed ? expandLabel : collapseLabel"
      :aria-label="collapsed ? expandLabel : collapseLabel"
      :aria-expanded="!collapsed"
      @click="emit('update:collapsed', !collapsed)"
    >
      <AppIcon name="chevron-down" />
    </button>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/foundation/components/AppIcon.vue'
import { useLocalization } from '@/foundation/modules/localization/localization'
import type { GeoSolarLightingCapability } from '../scene/scene.capabilities'
import type { GeoTimeController } from './time.controller'

const props = defineProps<{
  controller: GeoTimeController
  solarLighting: GeoSolarLightingCapability
  collapsed: boolean
  joinedWithStatus: boolean
  collapseLabel: string
  expandLabel: string
}>()

const emit = defineEmits<{
  'update:collapsed': [collapsed: boolean]
}>()

const { t } = useLocalization()
const speeds = [1, 10, 60, 600, 3600] as const
const currentFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'UTC',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})
const boundaryFormatter = new Intl.DateTimeFormat('zh-CN', {
  timeZone: 'UTC',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const progress = computed(function timelineProgress() {
  const duration = props.controller.state.stopTime - props.controller.state.startTime
  if (duration <= 0) {
    return 0
  }
  return Math.round(
    ((props.controller.state.currentTime - props.controller.state.startTime) / duration) * 1000,
  )
})

function formatCurrentTime(value: number): string {
  return `${currentFormatter.format(value)} UTC`
}

function formatBoundary(value: number): string {
  return boundaryFormatter.format(value)
}

function setProgress(event: Event): void {
  props.controller.setProgress(Number((event.target as HTMLInputElement).value) / 1000)
}

function setMultiplier(event: Event): void {
  props.controller.setMultiplier(Number((event.target as HTMLSelectElement).value))
}

function setLighting(event: Event): void {
  props.solarLighting.setLighting((event.target as HTMLInputElement).checked)
}

function setShadows(event: Event): void {
  props.solarLighting.setShadows((event.target as HTMLInputElement).checked)
}
</script>

<style scoped>
.geo-time-dock {
  min-height: 70px;
  display: grid;
  grid-template-columns: auto minmax(260px, 1fr) auto auto;
  align-items: center;
  gap: 18px;
  padding: 10px 14px;
  border: 1px solid var(--geo-line);
  border-radius: 15px;
  color: var(--geo-text-soft);
  background: var(--geo-surface-strong);
  box-shadow: var(--geo-shadow);
  backdrop-filter: blur(18px) saturate(125%);
  pointer-events: auto;
}

.geo-time-dock--joined-with-status {
  border-bottom: 0;
  border-radius: 15px 15px 0 0;
  box-shadow: none;
}

.geo-time-dock--collapsed {
  min-height: 44px;
  grid-template-columns: auto minmax(0, 1fr) auto;
  gap: 12px;
  padding: 5px 10px;
}

.geo-time-dock__controls,
.geo-time-dock__lighting,
.geo-time-dock__track,
.geo-time-dock__lighting label {
  display: flex;
  align-items: center;
}

.geo-time-dock__controls {
  gap: 8px;
}

.geo-time-dock button,
.geo-time-dock select {
  min-height: 32px;
  border: 1px solid var(--geo-line-strong);
  border-radius: 9px;
  color: var(--geo-text);
  background: rgba(17, 33, 46, 0.88);
}

.geo-time-dock__toggle {
  width: 32px;
  display: grid;
  place-items: center;
}

.geo-time-dock__toggle :deep(.icon) {
  width: 14px;
  height: 14px;
  transition: transform 0.18s ease;
}

.geo-time-dock--collapsed .geo-time-dock__toggle :deep(.icon) {
  transform: rotate(180deg);
}

.geo-time-dock button {
  cursor: pointer;
}

.geo-time-dock button:hover,
.geo-time-dock select:hover {
  border-color: color-mix(in srgb, var(--geo-accent), transparent 48%);
  background: var(--geo-surface-hover);
}

.geo-time-dock__play {
  width: 34px;
  color: var(--geo-accent) !important;
  font-size: 12px;
}

.geo-time-dock__now {
  padding: 0 10px;
  font-size: 10px;
}

.geo-time-dock strong {
  min-width: 132px;
  color: var(--geo-text);
  font-family: var(--font-display);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.geo-time-dock--collapsed strong {
  min-width: 0;
}

.geo-time-dock select {
  padding: 0 8px;
  font-family: var(--font-display);
  font-size: 10px;
}

.geo-time-dock__track {
  min-width: 0;
  gap: 10px;
}

.geo-time-dock__track span {
  color: var(--geo-text-faint);
  font-family: var(--font-display);
  font-size: 9px;
  font-variant-numeric: tabular-nums;
}

.geo-time-dock__track input {
  width: 100%;
  accent-color: var(--geo-accent);
  cursor: pointer;
}

.geo-time-dock__lighting {
  gap: 12px;
}

.geo-time-dock__lighting label {
  position: relative;
  gap: 7px;
  font-size: 10px;
  white-space: nowrap;
  cursor: pointer;
}

.geo-time-dock__lighting input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.geo-time-dock__lighting i {
  position: relative;
  width: 30px;
  height: 18px;
  border-radius: 12px;
  background: #253747;
}

.geo-time-dock__lighting i::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dce7ee;
  content: '';
  transition: transform 0.16s ease;
}

.geo-time-dock__lighting input:checked + i {
  background: var(--geo-accent);
}

.geo-time-dock__lighting input:checked + i::after {
  transform: translateX(12px);
}

.geo-time-dock__lighting input:focus-visible + i {
  outline: 2px solid var(--geo-accent);
  outline-offset: 3px;
}

@media (prefers-reduced-motion: reduce) {
  .geo-time-dock__lighting i::after,
  .geo-time-dock__toggle :deep(.icon) {
    transition: none;
  }
}
</style>
