<template>
  <div class="geo-data-panel">
    <section class="data-panel__section">
      <div class="data-panel__heading">
        <span>底图与注记</span><small>{{ controller.state.imagery.length }} 个图层</small>
      </div>
      <div class="data-panel__catalog">
        <button
          v-for="source in availableSources"
          :key="source.id"
          type="button"
          :disabled="
            controller.state.busy ||
            !controller.imageryAvailability(source.id).available ||
            controller.state.imagery.some((layer) => layer.sourceId === source.id)
          "
          :title="controller.imageryAvailability(source.id).reason || source.description"
          @click="controller.addImagery(source.id)"
        >
          <span>{{ source.label }}</span>
          <small>{{ source.coordinateSystem }}</small>
        </button>
      </div>
      <div v-if="controller.state.imagery.length" class="data-panel__layers">
        <div v-for="layer in controller.state.imagery" :key="layer.id" class="data-panel__layer">
          <label>
            <input
              type="checkbox"
              :checked="layer.show"
              @change="
                controller.setImageryVisible(layer.id, ($event.target as HTMLInputElement).checked)
              "
            />
            <span>{{ layer.label }}</span>
          </label>
          <div class="data-panel__layer-actions">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              :value="layer.alpha"
              :aria-label="`${layer.label} 透明度`"
              @input="
                controller.setImageryAlpha(
                  layer.id,
                  Number(($event.target as HTMLInputElement).value),
                )
              "
            />
            <button type="button" title="上移" @click="controller.raiseImagery(layer.id)">↑</button>
            <button type="button" title="下移" @click="controller.lowerImagery(layer.id)">↓</button>
            <button type="button" title="定位" @click="controller.flyToImagery(layer.id)">⌖</button>
            <button type="button" title="移除" @click="controller.removeImagery(layer.id)">
              ×
            </button>
          </div>
          <small v-if="layer.warning" class="data-panel__warning">{{ layer.warning }}</small>
          <small v-if="layer.error" class="data-panel__error">{{ layer.error }}</small>
        </div>
      </div>
    </section>

    <section class="data-panel__section">
      <div class="data-panel__heading">
        <span>地形</span><small>{{ controller.state.terrain.label }}</small>
      </div>
      <div class="data-panel__terrain">
        <button
          type="button"
          :class="{ 'is-active': controller.state.terrain.id === 'ellipsoid' }"
          @click="controller.setTerrain('ellipsoid')"
        >
          椭球体
        </button>
        <button
          type="button"
          :class="{ 'is-active': controller.state.terrain.id === 'cesium-world-terrain' }"
          @click="controller.setTerrain('cesium-world-terrain')"
        >
          World Terrain
        </button>
      </div>
      <small v-if="controller.state.terrain.error" class="data-panel__error">{{
        controller.state.terrain.error
      }}</small>
    </section>

    <section class="data-panel__section">
      <div class="data-panel__heading"><span>外部数据</span><small>浏览器加载</small></div>
      <label class="data-panel__input"
        ><span>GeoJSON URL</span
        ><input v-model="geoJsonUrl" type="url" placeholder="https://…/data.geojson"
      /></label>
      <button
        class="data-panel__primary"
        type="button"
        :disabled="!geoJsonUrl || controller.state.busy"
        @click="loadGeoJson"
      >
        加载 GeoJSON
      </button>
      <label class="data-panel__input"
        ><span>模型 URL</span
        ><input v-model="modelUrl" type="url" placeholder="https://…/model.glb"
      /></label>
      <button
        class="data-panel__primary"
        type="button"
        :disabled="!modelUrl || controller.state.busy"
        @click="loadModel"
      >
        加载 glTF / GLB
      </button>
      <label class="data-panel__input"
        ><span>3D Tiles URL</span
        ><input v-model="tilesetUrl" type="url" placeholder="https://…/tileset.json"
      /></label>
      <button
        class="data-panel__primary"
        type="button"
        :disabled="!tilesetUrl || controller.state.busy"
        @click="loadTileset"
      >
        加载 3D Tiles
      </button>
    </section>

    <section v-if="controller.state.resources.length" class="data-panel__section">
      <div class="data-panel__heading"><span>已加载数据</span></div>
      <div
        v-for="resource in controller.state.resources"
        :key="resource.id"
        class="data-panel__resource"
      >
        <label
          ><input
            type="checkbox"
            :checked="resource.show"
            @change="
              controller.setResourceVisible(
                resource.id,
                ($event.target as HTMLInputElement).checked,
              )
            "
          /><span>{{ resource.label }}</span></label
        >
        <button type="button" title="定位" @click="controller.flyToResource(resource.id)">⌖</button>
        <button type="button" title="移除" @click="controller.removeResource(resource.id)">
          ×
        </button>
      </div>
    </section>

    <p v-if="controller.state.error" class="data-panel__error">{{ controller.state.error }}</p>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { GeoDataController } from './data.controller'

const props = defineProps<{ controller: GeoDataController }>()
const geoJsonUrl = ref('')
const modelUrl = ref('')
const tilesetUrl = ref('')
const availableSources = computed(function availableSources() {
  return props.controller.imageryCatalog
})

async function loadGeoJson(): Promise<void> {
  await props.controller.loadGeoJson({ url: geoJsonUrl.value, label: 'GeoJSON 数据' })
}

async function loadModel(): Promise<void> {
  await props.controller.loadModel({ url: modelUrl.value, label: '外部模型' })
}

async function loadTileset(): Promise<void> {
  await props.controller.loadTileset({ url: tilesetUrl.value, label: '外部 3D Tiles' })
}
</script>

<style scoped>
.geo-data-panel {
  display: grid;
  gap: 18px;
}
.data-panel__section {
  display: grid;
  gap: 10px;
}
.data-panel__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--geo-text-soft, #b6c5d2);
  font-size: 11px;
  font-weight: 700;
}
.data-panel__heading small {
  color: var(--geo-text-faint, #7890a2);
  font-size: 9px;
  font-weight: 500;
}
.data-panel__catalog {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;
}
.data-panel__catalog button,
.data-panel__terrain button {
  min-height: 38px;
  display: grid;
  gap: 2px;
  padding: 7px 9px;
  border: 1px solid var(--geo-line, #263c4e);
  border-radius: 9px;
  color: var(--geo-text, #eff8ff);
  background: var(--geo-surface-strong, #0e1c2a);
  cursor: pointer;
  font-size: 10px;
  text-align: left;
}
.data-panel__catalog button:hover:not(:disabled),
.data-panel__terrain button:hover,
.data-panel__terrain button.is-active {
  border-color: var(--geo-accent, #45c8ff);
}
.data-panel__catalog button small {
  color: var(--geo-text-faint, #7890a2);
  font-size: 8px;
}
.data-panel__catalog button:disabled {
  cursor: wait;
  opacity: 0.5;
}
.data-panel__layers {
  display: grid;
  gap: 7px;
}
.data-panel__layer {
  display: grid;
  gap: 7px;
  padding: 8px;
  border: 1px solid var(--geo-line, #263c4e);
  border-radius: 9px;
  background: color-mix(in srgb, var(--geo-surface-strong, #0e1c2a), transparent 20%);
}
.data-panel__layer label,
.data-panel__resource label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--geo-text, #eff8ff);
  font-size: 10px;
}
.data-panel__layer-actions {
  display: grid;
  grid-template-columns: 1fr repeat(4, 24px);
  align-items: center;
  gap: 4px;
}
.data-panel__layer-actions input {
  width: 100%;
  accent-color: var(--geo-accent, #45c8ff);
}
.data-panel__layer-actions button,
.data-panel__resource button {
  width: 24px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 6px;
  color: var(--geo-text-faint, #7890a2);
  background: transparent;
  cursor: pointer;
}
.data-panel__layer-actions button:hover,
.data-panel__resource button:hover {
  color: var(--geo-text, #eff8ff);
  background: var(--geo-surface-hover, #1b2a38);
}
.data-panel__warning,
.data-panel__error {
  color: #ffcb78;
  font-size: 9px;
  line-height: 1.45;
}
.data-panel__error {
  margin: 0;
  color: #ff9ca7;
}
.data-panel__terrain {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
}
.data-panel__input {
  display: grid;
  gap: 5px;
  color: var(--geo-text-faint, #7890a2);
  font-size: 9px;
}
.data-panel__input input {
  min-height: 32px;
  padding: 0 9px;
  border: 1px solid var(--geo-line, #263c4e);
  border-radius: 8px;
  color: var(--geo-text, #eff8ff);
  background: #091522;
  font-size: 10px;
}
.data-panel__primary {
  min-height: 34px;
  border: 1px solid color-mix(in srgb, var(--geo-accent, #45c8ff), transparent 40%);
  border-radius: 8px;
  color: #06111d;
  background: var(--geo-accent, #45c8ff);
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
}
.data-panel__primary:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
.data-panel__resource {
  display: grid;
  grid-template-columns: 1fr 24px 24px;
  align-items: center;
  gap: 5px;
  padding: 6px 0;
  border-bottom: 1px solid var(--geo-line, #263c4e);
}
</style>
