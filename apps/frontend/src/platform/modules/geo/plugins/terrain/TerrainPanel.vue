<template>
  <section class="terrain-panel">
    <section class="terrain-panel__section terrain-panel__section--primary">
      <header class="terrain-panel__header">
        <div>
          <h3>地形剖面</h3>
          <p>在地图上单击添加折点，双击结束并沿线采样。</p>
        </div>
        <span v-if="controller.state.sampled.length" class="terrain-panel__badge">已采样</span>
      </header>

      <p v-if="!controller.state.terrainAvailable" class="terrain-panel__notice" role="status">
        <strong>未加载可采样地形</strong>
        <span>请先到“数据”面板加载 World Terrain 或自定义地形。</span>
      </p>

      <button
        class="terrain-panel__button terrain-panel__button--primary"
        type="button"
        :disabled="!controller.state.terrainAvailable || isSamplingProfile"
        @click="toggleProfile"
      >
        {{ isDrawingProfile ? '取消画线' : isSamplingProfile ? '正在采样…' : '绘制采样线' }}
      </button>

      <div v-if="profileStats" class="terrain-profile" aria-live="polite">
        <svg
          class="terrain-profile__chart"
          viewBox="0 0 320 140"
          role="img"
          :aria-label="profileAriaLabel"
        >
          <defs>
            <linearGradient id="terrain-profile-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#55d6ff" stop-opacity="0.42" />
              <stop offset="1" stop-color="#55d6ff" stop-opacity="0.04" />
            </linearGradient>
          </defs>
          <line x1="18" y1="122" x2="308" y2="122" class="terrain-profile__axis" />
          <line x1="18" y1="12" x2="18" y2="122" class="terrain-profile__axis" />
          <polygon :points="profileAreaPoints" fill="url(#terrain-profile-fill)" />
          <polyline :points="profileLinePoints" class="terrain-profile__line" />
        </svg>
        <div class="terrain-profile__stats">
          <span
            >距离<strong>{{ formatDistance(profileStats.distance) }}</strong></span
          >
          <span
            >最低<strong>{{ profileStats.minimum.toFixed(1) }} m</strong></span
          >
          <span
            >最高<strong>{{ profileStats.maximum.toFixed(1) }} m</strong></span
          >
        </div>
      </div>
      <p v-else class="terrain-panel__hint">完成采样后将在这里显示沿线高程剖面。</p>
    </section>

    <section class="terrain-panel__section">
      <header class="terrain-panel__header">
        <div>
          <h3>等高线</h3>
          <p>基于当前地形绘制，无需输入坐标。</p>
        </div>
        <span v-if="controller.state.colorMode === 'contour'" class="terrain-panel__badge">
          已启用
        </span>
      </header>

      <p v-if="!controller.state.terrainAvailable" class="terrain-panel__notice" role="status">
        <strong>未加载地形，等高线无法使用</strong>
        <span>请先到“数据”面板加载 World Terrain 或自定义地形。</span>
      </p>

      <label class="terrain-panel__field">
        <span>等高距</span>
        <div class="terrain-panel__number-input">
          <input
            v-model.number="contourInterval"
            type="number"
            min="1"
            max="10000"
            step="1"
            :disabled="!controller.state.terrainAvailable"
          />
          <span>米</span>
        </div>
      </label>

      <div class="terrain-panel__actions">
        <button
          class="terrain-panel__button terrain-panel__button--primary"
          type="button"
          :disabled="!controller.state.terrainAvailable"
          @click="applyContour"
        >
          {{ controller.state.colorMode === 'contour' ? '更新等高线' : '启用等高线' }}
        </button>
        <button
          v-if="controller.state.colorMode === 'contour'"
          class="terrain-panel__button"
          type="button"
          @click="controller.clearTerrainColorMode"
        >
          关闭
        </button>
      </div>
    </section>

    <section class="terrain-panel__section">
      <header class="terrain-panel__header">
        <div>
          <h3>地形着色</h3>
          <p>切换高程、坡度或坡向表达。</p>
        </div>
      </header>
      <div class="terrain-panel__grid terrain-panel__grid--colors">
        <button
          type="button"
          :disabled="!controller.state.terrainAvailable"
          @click="controller.setTerrainColorMode('elevation')"
        >
          高程
        </button>
        <button
          type="button"
          :disabled="!controller.state.terrainAvailable"
          @click="controller.setTerrainColorMode('slope')"
        >
          坡度
        </button>
        <button
          type="button"
          :disabled="!controller.state.terrainAvailable"
          @click="controller.setTerrainColorMode('aspect')"
        >
          坡向
        </button>
      </div>
    </section>

    <details class="terrain-panel__section terrain-panel__details">
      <summary>
        <span>坐标淹没</span>
        <small>多边形水面模拟</small>
      </summary>
      <div class="terrain-panel__details-body">
        <p class="terrain-panel__hint">
          每行输入一个经度、纬度和可选高程，至少三行，例如：116.391,39.907,50。
        </p>
        <label class="terrain-panel__field">
          <span>分析坐标</span>
          <textarea v-model="positionsText" rows="4" spellcheck="false" />
        </label>
        <label class="terrain-panel__field">
          <span>水面高程</span>
          <div class="terrain-panel__number-input">
            <input v-model.number="waterHeight" type="number" step="1" />
            <span>米</span>
          </div>
        </label>
        <button type="button" @click="runFlood">开始淹没</button>
      </div>
    </details>

    <p v-if="controller.state.status !== 'idle'" class="terrain-panel__status" aria-live="polite">
      {{ statusText }}
    </p>
    <p v-if="inputError" class="terrain-panel__error">{{ inputError }}</p>
    <p v-if="controller.state.error" class="terrain-panel__error">{{ controller.state.error }}</p>
    <div class="terrain-panel__footer">
      <button
        type="button"
        :disabled="controller.state.status !== 'running'"
        @click="controller.cancel"
      >
        取消分析
      </button>
      <button type="button" @click="controller.clear">清除分析结果</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { Cartesian3 } from 'cesium'
import type { TerrainController } from './terrain.controller'

const props = defineProps<{ controller: TerrainController }>()
const positionsText = ref('116.391,39.907,50\n116.405,39.907,50\n116.405,39.918,50')
const waterHeight = ref(80)
const contourInterval = ref(props.controller.state.contourInterval)
const inputError = ref('')
const isDrawingProfile = computed(() => props.controller.state.activity === 'drawing-profile')
const isSamplingProfile = computed(() => props.controller.state.activity === 'sampling-profile')
const profileStats = computed(function terrainProfileStats() {
  const sampled = props.controller.state.sampled
  if (!sampled.length) {
    return undefined
  }
  const heights = sampled.map((sample) => sample.height)
  return {
    distance: sampled.at(-1)?.distanceMeters ?? 0,
    minimum: Math.min(...heights),
    maximum: Math.max(...heights),
  }
})
const profileLinePoints = computed(function terrainProfileLinePoints() {
  const sampled = props.controller.state.sampled
  const stats = profileStats.value
  if (!stats || !sampled.length) {
    return ''
  }
  const heightRange = Math.max(stats.maximum - stats.minimum, 1)
  const distance = Math.max(stats.distance, 1)
  return sampled
    .map(function toChartPoint(sample) {
      const x = 18 + (sample.distanceMeters / distance) * 290
      const y = 122 - ((sample.height - stats.minimum) / heightRange) * 110
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')
})
const profileAreaPoints = computed(function terrainProfileAreaPoints() {
  return profileLinePoints.value ? `18,122 ${profileLinePoints.value} 308,122` : ''
})
const profileAriaLabel = computed(function terrainProfileAriaLabel() {
  const stats = profileStats.value
  return stats
    ? `地形剖面，总距离 ${formatDistance(stats.distance)}，最低高程 ${stats.minimum.toFixed(1)} 米，最高高程 ${stats.maximum.toFixed(1)} 米`
    : '地形剖面'
})

const statusText = computed(function formatStatus() {
  if (props.controller.state.status === 'running') {
    if (props.controller.state.activity === 'drawing-profile') {
      return '正在画采样线 · 单击添加折点，双击结束，Esc 取消'
    }
    if (props.controller.state.activity === 'sampling-profile') {
      return `正在采样地形 · ${Math.round(props.controller.state.progress * 100)}%`
    }
    return `分析中 · ${Math.round(props.controller.state.progress * 100)}%`
  }
  if (props.controller.state.status === 'complete') {
    return '分析完成'
  }
  return '分析失败'
})

function parsePositions(minimum = 1): Cartesian3[] | undefined {
  const positions: Cartesian3[] = []
  for (const [index, line] of positionsText.value.split(/\r?\n/).entries()) {
    const tokens = line.split(/[，,\s]+/).filter((value) => value.trim() !== '')
    const values = tokens.map((value) => Number(value.trim()))
    if (line.trim() === '') {
      continue
    }
    if (values.length < 2 || values.length > 3 || values.some((value) => !Number.isFinite(value))) {
      inputError.value = `第 ${index + 1} 行需要经度、纬度和可选高程`
      return undefined
    }
    if (values[0] < -180 || values[0] > 180 || values[1] < -90 || values[1] > 90) {
      inputError.value = `第 ${index + 1} 行的经纬度超出范围`
      return undefined
    }
    positions.push(Cartesian3.fromDegrees(values[0], values[1], values[2] ?? 0))
  }
  if (positions.length < minimum) {
    inputError.value = `当前分析至少需要 ${minimum} 个有效坐标`
    return undefined
  }
  inputError.value = ''
  return positions
}

function applyContour(): void {
  const interval = Number(contourInterval.value)
  if (!Number.isFinite(interval) || interval < 1 || interval > 10_000) {
    inputError.value = '等高距需要在 1 到 10000 米之间'
    return
  }
  inputError.value = ''
  props.controller.setContour(interval)
}

function toggleProfile(): void {
  if (isDrawingProfile.value) {
    props.controller.cancel()
    return
  }
  props.controller.startProfile()
}

function formatDistance(distanceMeters: number): string {
  return distanceMeters >= 1000
    ? `${(distanceMeters / 1000).toFixed(2)} km`
    : `${distanceMeters.toFixed(1)} m`
}

function runFlood(): void {
  const positions = parsePositions(3)
  if (positions) {
    props.controller.startFlood(positions, waterHeight.value, 3000)
  }
}
</script>

<style scoped>
.terrain-panel {
  display: grid;
  gap: 12px;
  color: var(--geo-text, #eaf6ff);
  font-size: 12px;
}

.terrain-panel__section {
  display: grid;
  gap: 12px;
  padding: 14px;
  border: 1px solid var(--geo-line, rgb(117 167 199 / 18%));
  border-radius: 12px;
  background: rgb(9 25 38 / 58%);
}

.terrain-panel__section--primary {
  border-color: rgb(85 214 255 / 35%);
  background: linear-gradient(135deg, rgb(85 214 255 / 8%), transparent 55%), rgb(9 25 38 / 76%);
}

.terrain-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.terrain-panel__header h3,
.terrain-panel__header p {
  margin: 0;
}

.terrain-panel__header h3 {
  color: var(--geo-text, #eaf6ff);
  font-size: 13px;
  font-weight: 650;
  letter-spacing: 0.02em;
}

.terrain-panel__header p {
  margin-top: 4px;
  color: var(--geo-text-faint, #8da4b8);
  line-height: 1.5;
}

.terrain-panel__badge {
  flex: none;
  padding: 3px 7px;
  border: 1px solid rgb(85 214 255 / 32%);
  border-radius: 999px;
  color: var(--geo-accent, #55d6ff);
  background: rgb(85 214 255 / 9%);
  font-size: 11px;
}

.terrain-profile {
  display: grid;
  gap: 10px;
}

.terrain-profile__chart {
  width: 100%;
  min-height: 126px;
  overflow: visible;
  border: 1px solid var(--geo-line, rgb(117 167 199 / 18%));
  border-radius: 10px;
  background: rgb(4 15 25 / 58%);
}

.terrain-profile__axis {
  stroke: rgb(141 164 184 / 35%);
  stroke-width: 1;
}

.terrain-profile__line {
  fill: none;
  stroke: var(--geo-accent, #55d6ff);
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.5;
}

.terrain-profile__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
}

.terrain-profile__stats span {
  display: grid;
  gap: 3px;
  padding: 8px;
  border: 1px solid var(--geo-line, rgb(117 167 199 / 18%));
  border-radius: 8px;
  color: var(--geo-text-faint, #8da4b8);
  background: rgb(4 15 25 / 38%);
  font-size: 10px;
}

.terrain-profile__stats strong {
  color: var(--geo-text, #eaf6ff);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.terrain-panel__notice {
  display: grid;
  gap: 3px;
  margin: 0;
  padding: 10px 11px;
  border: 1px solid rgb(255 190 92 / 30%);
  border-radius: 9px;
  color: #ffd18a;
  background: rgb(101 66 16 / 24%);
  line-height: 1.45;
}

.terrain-panel__notice span {
  color: #d6b982;
}

.terrain-panel__field {
  display: grid;
  gap: 6px;
  color: var(--geo-text-faint, #8da4b8);
}

.terrain-panel__number-input {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  border: 1px solid var(--geo-line-strong, #31556c);
  border-radius: 8px;
  background: var(--geo-surface-strong, #0c1b29);
}

.terrain-panel__number-input:focus-within {
  border-color: var(--geo-accent, #55d6ff);
}

.terrain-panel__number-input input {
  border: 0;
  background: transparent;
  outline: 0;
}

.terrain-panel__number-input span {
  padding-right: 10px;
  color: var(--geo-text-faint, #8da4b8);
}

.terrain-panel textarea,
.terrain-panel input {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
  color: var(--geo-text, #eaf6ff);
  font: inherit;
}

.terrain-panel textarea {
  resize: vertical;
  border: 1px solid var(--geo-line-strong, #31556c);
  border-radius: 8px;
  background: var(--geo-surface-strong, #0c1b29);
}

.terrain-panel__actions,
.terrain-panel__grid,
.terrain-panel__footer {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.terrain-panel__grid--colors {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.terrain-panel__actions > :only-child {
  grid-column: 1 / -1;
}

.terrain-panel button {
  min-height: 36px;
  border: 1px solid var(--geo-line-strong, #31556c);
  border-radius: 8px;
  color: inherit;
  background: var(--geo-surface-strong, #0c1b29);
  cursor: pointer;
}

.terrain-panel__button--primary {
  border-color: rgb(85 214 255 / 48%);
  color: #06202d;
  background: var(--geo-accent, #55d6ff);
  font-weight: 650;
}

.terrain-panel button:hover:not(:disabled),
.terrain-panel button:focus-visible {
  border-color: var(--geo-accent, #55d6ff);
}

.terrain-panel button:disabled,
.terrain-panel input:disabled {
  cursor: not-allowed;
  opacity: 0.42;
}

.terrain-panel__details {
  padding: 0;
}

.terrain-panel__details summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 14px;
  cursor: pointer;
  list-style: none;
}

.terrain-panel__details summary::-webkit-details-marker {
  display: none;
}

.terrain-panel__details summary::after {
  content: '+';
  color: var(--geo-accent, #55d6ff);
  font-size: 17px;
}

.terrain-panel__details[open] summary::after {
  content: '−';
}

.terrain-panel__details summary small {
  margin-left: auto;
  margin-right: 10px;
  color: var(--geo-text-faint, #8da4b8);
}

.terrain-panel__details-body {
  display: grid;
  gap: 10px;
  padding: 0 14px 14px;
}

.terrain-panel__hint,
.terrain-panel__status,
.terrain-panel__error {
  margin: 0;
  line-height: 1.5;
}

.terrain-panel__hint,
.terrain-panel__status {
  color: var(--geo-text-faint, #8da4b8);
}

.terrain-panel__error {
  color: #ff9aa8;
}
</style>
