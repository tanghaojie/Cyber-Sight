<template>
  <div class="measurement-panel">
    <div class="measurement-panel__modes" role="group" :aria-label="title">
      <button
        :class="{ 'is-active': controller.state.mode === 'distance' }"
        type="button"
        @click="startMode('distance')"
      >
        {{ distanceLabel }}
      </button>
      <button
        :class="{ 'is-active': controller.state.mode === 'area' }"
        type="button"
        @click="startMode('area')"
      >
        {{ areaLabel }}
      </button>
      <button
        :class="{ 'is-active': controller.state.mode === 'point' }"
        type="button"
        @click="controller.startPoint"
      >
        {{ pointLabel ?? '点位' }}
      </button>
    </div>

    <label class="measurement-field">
      <span>{{ unitLabel }}</span>
      <select v-model="unit">
        <option value="kilometers">{{ unitKilometersLabel }}</option>
        <option value="meters">{{ unitMetersLabel }}</option>
      </select>
    </label>

    <label class="measurement-toggle">
      <span>{{ snapLabel }}<small>Cesium Globe</small></span>
      <input :checked="true" type="checkbox" disabled />
      <i aria-hidden="true" />
    </label>

    <button
      class="measurement-panel__primary"
      :class="{ 'is-active': controller.state.status === 'measuring' }"
      type="button"
      @click="toggleMeasurement"
    >
      <AppIcon :name="controller.state.status === 'measuring' ? 'close' : 'map-pin'" />
      {{ controller.state.status === 'measuring' ? cancelLabel : startLabel }}
    </button>

    <section class="measurement-result" aria-live="polite">
      <div class="measurement-result__heading">
        <span>{{ currentResultLabel }}</span>
        <button
          type="button"
          :disabled="!hasResult"
          :title="clearLabel"
          :aria-label="clearLabel"
          @click="controller.clearCurrent()"
        >
          <AppIcon name="trash" />
        </button>
      </div>
      <div class="measurement-result__value">
        <span aria-hidden="true"><i /><i /><i /></span>
        <strong v-if="formattedResult">{{ formattedResult }}</strong>
        <small v-else>{{ emptyResultLabel }}</small>
      </div>
      <p v-if="controller.state.error" class="measurement-result__error">
        {{ controller.state.error }}
      </p>
    </section>

    <div class="measurement-panel__exit"><kbd>Esc</kbd>{{ exitHintLabel.replace('Esc ', '') }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import AppIcon from '@/foundation/components/AppIcon.vue'
import type { MeasurementController } from './measurement.controller'

const props = defineProps<{
  controller: MeasurementController
  title: string
  distanceLabel: string
  areaLabel: string
  pointLabel?: string
  unitLabel: string
  unitMetersLabel: string
  unitKilometersLabel: string
  snapLabel: string
  startLabel: string
  cancelLabel: string
  clearLabel: string
  currentResultLabel: string
  emptyResultLabel: string
  exitHintLabel: string
}>()

const unit = ref<'meters' | 'kilometers'>('kilometers')
const hasResult = computed(function hasMeasurementResult() {
  return Boolean(
    props.controller.state.resultMeters !== undefined ||
    props.controller.state.resultSquareMeters !== undefined ||
    props.controller.state.point,
  )
})
const formattedResult = computed(function measurementResult() {
  if (props.controller.state.resultSquareMeters !== undefined) {
    return `${props.controller.state.resultSquareMeters.toFixed(1)} m²`
  }
  if (props.controller.state.point) {
    const point = props.controller.state.point
    return `${point.longitude.toFixed(5)}, ${point.latitude.toFixed(5)}`
  }
  const resultMeters = props.controller.state.resultMeters
  if (resultMeters === undefined) {
    return ''
  }
  if (unit.value === 'meters') {
    return `${resultMeters.toFixed(1)} m`
  }
  return `${(resultMeters / 1000).toFixed(2)} km`
})

function toggleMeasurement(): void {
  if (props.controller.state.status === 'measuring') {
    props.controller.cancel()
    return
  }
  if (props.controller.state.mode === 'area') {
    props.controller.startArea()
  } else if (props.controller.state.mode === 'point') {
    props.controller.startPoint()
  } else {
    props.controller.startDistance()
  }
}

function startMode(mode: 'distance' | 'area'): void {
  if (mode === 'distance') {
    props.controller.startDistance()
  } else {
    props.controller.startArea()
  }
}
</script>

<style scoped>
.measurement-panel {
  min-height: 100%;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.measurement-panel__modes {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  padding: 3px;
  border: 1px solid var(--geo-line);
  border-radius: 12px;
  background: color-mix(in srgb, var(--geo-surface-strong), transparent 18%);
}

.measurement-panel__modes button {
  min-height: 38px;
  border: 1px solid transparent;
  border-radius: 9px;
  color: var(--geo-text-faint);
  background: transparent;
  font-size: 11px;
}

.measurement-panel__modes button.is-active {
  border-color: color-mix(in srgb, var(--geo-accent), transparent 48%);
  color: var(--geo-text);
  background: color-mix(in srgb, var(--geo-accent), transparent 84%);
}

.measurement-panel__modes button:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.measurement-field {
  display: grid;
  gap: 8px;
}

.measurement-field > span,
.measurement-toggle > span,
.measurement-result__heading > span {
  color: var(--geo-text-soft);
  font-size: 10px;
  font-weight: 690;
}

.measurement-field select {
  width: 100%;
  min-height: 42px;
  padding: 0 12px;
  border: 1px solid var(--geo-line-strong);
  border-radius: 11px;
  outline: 0;
  color: var(--geo-text);
  background: #0b1622;
  font-size: 11px;
}

.measurement-field select:focus {
  border-color: var(--geo-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--geo-accent), transparent 84%);
}

.measurement-toggle {
  position: relative;
  min-height: 42px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.measurement-toggle > span {
  display: grid;
  gap: 3px;
}

.measurement-toggle small {
  color: var(--geo-text-faint);
  font-size: 8px;
  font-weight: 500;
}

.measurement-toggle input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.measurement-toggle i {
  position: relative;
  width: 38px;
  height: 22px;
  flex: 0 0 auto;
  border-radius: 20px;
  background: color-mix(in srgb, var(--geo-text), transparent 86%);
  transition: background-color 0.18s ease;
}

.measurement-toggle i::after {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #f5fbff;
  content: '';
  transition: transform 0.18s ease;
}

.measurement-toggle input:checked + i {
  background: var(--geo-accent-deep);
}

.measurement-toggle input:checked + i::after {
  transform: translateX(16px);
}

.measurement-toggle input:focus-visible + i {
  outline: 2px solid var(--geo-accent);
  outline-offset: 3px;
}

.measurement-panel__primary {
  min-height: 46px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 1px solid color-mix(in srgb, var(--geo-accent), transparent 30%);
  border-radius: 12px;
  color: #04121d;
  background: linear-gradient(135deg, #58d4ff, #3698ff);
  box-shadow: 0 12px 26px color-mix(in srgb, #197fd9, transparent 68%);
  font-size: 11px;
  font-weight: 780;
  transition:
    transform 0.18s ease,
    filter 0.18s ease;
}

.measurement-panel__primary:hover,
.measurement-panel__primary:focus-visible {
  outline: 0;
  filter: brightness(1.08);
  transform: translateY(-1px);
}

.measurement-panel__primary.is-active {
  color: var(--geo-text);
  background: color-mix(in srgb, #e45566, #101a24 52%);
  box-shadow: none;
}

.measurement-result {
  display: grid;
  gap: 12px;
  padding-top: 17px;
  border-top: 1px solid var(--geo-line);
}

.measurement-result__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.measurement-result__heading button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 10px;
  color: var(--geo-text-faint);
  background: transparent;
}

.measurement-result__heading button:hover:not(:disabled),
.measurement-result__heading button:focus-visible:not(:disabled) {
  outline: 0;
  color: var(--geo-text);
  background: var(--geo-surface-hover);
}

.measurement-result__heading button:disabled {
  cursor: not-allowed;
  opacity: 0.35;
}

.measurement-result__value {
  min-height: 72px;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px;
  border: 1px solid var(--geo-line);
  border-radius: 13px;
  background: color-mix(in srgb, var(--geo-surface-strong), transparent 16%);
}

.measurement-result__value > span {
  position: relative;
  width: 46px;
  height: 34px;
  flex: 0 0 auto;
}

.measurement-result__value > span::before {
  position: absolute;
  top: 17px;
  right: 7px;
  left: 7px;
  height: 2px;
  background: var(--geo-accent);
  content: '';
  transform: rotate(-32deg);
  transform-origin: center;
}

.measurement-result__value > span i {
  position: absolute;
  z-index: 1;
  width: 8px;
  height: 8px;
  border: 2px solid #07111c;
  border-radius: 50%;
  background: var(--geo-accent);
}

.measurement-result__value > span i:first-child {
  bottom: 2px;
  left: 3px;
}

.measurement-result__value > span i:nth-child(2) {
  top: 13px;
  left: 19px;
}

.measurement-result__value > span i:last-child {
  top: 2px;
  right: 3px;
}

.measurement-result__value strong {
  font-family: var(--font-display);
  font-size: 24px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.04em;
}

.measurement-result__value small {
  color: var(--geo-text-faint);
  font-size: 10px;
}

.measurement-result__error {
  margin: 0;
  color: #ff9ba7;
  font-size: 10px;
  line-height: 1.5;
}

.measurement-panel__exit {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: auto;
  color: var(--geo-text-faint);
  font-size: 9px;
}

.measurement-panel__exit kbd {
  padding: 4px 8px;
  border: 1px solid var(--geo-line-strong);
  border-bottom-color: color-mix(in srgb, var(--geo-line-strong), white 18%);
  border-radius: 6px;
  color: var(--geo-text-soft);
  background: var(--geo-surface-strong);
  box-shadow: 0 2px 0 #03080e;
  font-family: inherit;
}
</style>
