<template>
  <section class="geo-tool-panel">
    <p class="geo-tool-panel__hint">每行输入一个经度、纬度和可选高程，例如：116.391,39.907,50。</p>
    <label class="geo-tool-panel__field">
      <span>分析坐标</span>
      <textarea v-model="positionsText" rows="4" spellcheck="false" />
    </label>
    <div class="geo-tool-panel__inputs">
      <label class="geo-tool-panel__field">
        <span>水面高程（米）</span>
        <input v-model.number="waterHeight" type="number" step="1" />
      </label>
      <label class="geo-tool-panel__field">
        <span>等高距（米）</span>
        <input v-model.number="contourInterval" type="number" min="1" step="1" />
      </label>
    </div>
    <div class="geo-tool-panel__grid">
      <button type="button" @click="runSample">采样</button>
      <button type="button" @click="runContours">等高线</button>
      <button type="button" @click="runFlood">淹没</button>
    </div>
    <div class="geo-tool-panel__grid geo-tool-panel__grid--colors">
      <button type="button" @click="controller.setTerrainColorMode('elevation')">高程</button>
      <button type="button" @click="controller.setTerrainColorMode('contour')">色带</button>
      <button type="button" @click="controller.setTerrainColorMode('slope')">坡度</button>
      <button type="button" @click="controller.setTerrainColorMode('aspect')">坡向</button>
    </div>
    <p class="geo-tool-panel__status">
      {{ controller.state.status }} · {{ Math.round(controller.state.progress * 100) }}% ·
      {{ controller.state.contourCount }} 条等高线
    </p>
    <p v-if="inputError" class="geo-tool-panel__error">{{ inputError }}</p>
    <button
      type="button"
      :disabled="controller.state.status !== 'running'"
      @click="controller.cancel"
    >
      取消分析
    </button>
    <button type="button" @click="controller.clear">清除分析结果</button>
    <p v-if="controller.state.error" class="geo-tool-panel__error">{{ controller.state.error }}</p>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Cartesian3 } from 'cesium'
import type { TerrainController } from './terrain.controller'

const props = defineProps<{ controller: TerrainController }>()
const positionsText = ref('116.391,39.907,50\n116.405,39.907,50\n116.405,39.918,50')
const waterHeight = ref(80)
const contourInterval = ref(25)
const inputError = ref('')

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

async function runSample(): Promise<void> {
  const positions = parsePositions()
  if (positions) {
    await props.controller.sample(positions)
  }
}

async function runContours(): Promise<void> {
  const positions = parsePositions(2)
  if (positions) {
    await props.controller.createContours(positions, Math.max(contourInterval.value, 1))
  }
}

function runFlood(): void {
  const positions = parsePositions(3)
  if (positions) {
    props.controller.startFlood(positions, waterHeight.value, 3000)
  }
}
</script>

<style scoped>
.geo-tool-panel {
  display: grid;
  gap: 12px;
  color: var(--geo-text, #eaf6ff);
  font-size: 12px;
}

.geo-tool-panel__grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}

.geo-tool-panel__grid--colors {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.geo-tool-panel__inputs {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.geo-tool-panel__field {
  display: grid;
  gap: 6px;
  color: var(--geo-text-faint, #8da4b8);
}

.geo-tool-panel textarea,
.geo-tool-panel input {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--geo-line-strong, #31556c);
  border-radius: 8px;
  padding: 8px;
  color: var(--geo-text, #eaf6ff);
  background: var(--geo-surface-strong, #0c1b29);
  font: inherit;
}

.geo-tool-panel button {
  min-height: 34px;
  border: 1px solid var(--geo-line-strong, #31556c);
  border-radius: 8px;
  color: inherit;
  background: var(--geo-surface-strong, #0c1b29);
  cursor: pointer;
}

.geo-tool-panel button:hover:not(:disabled),
.geo-tool-panel button:focus-visible {
  border-color: var(--geo-accent, #55d6ff);
}

.geo-tool-panel button:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.geo-tool-panel__hint,
.geo-tool-panel__status {
  margin: 0;
  color: var(--geo-text-faint, #8da4b8);
}

.geo-tool-panel__error {
  margin: 0;
  color: #ff9aa8;
}
</style>
