<template>
  <main ref="workspaceRoot" class="geo-workspace" :aria-label="t('geo.views.workspace')">
    <div
      ref="mapContainer"
      class="geo-map-host"
      :class="{ 'geo-map-host--crosshair': runtime.interactions.state.cursor === 'crosshair' }"
    />
    <div class="geo-map-atmosphere" aria-hidden="true" />

    <template v-if="runtime.state.status === 'ready' && measurementController">
      <GeoTopBar
        :title="t('geo.workspace.title')"
        :scene-name="t('geo.workspace.scene')"
        :session-label="t('geo.workspace.localScene')"
      />

      <GeoToolRail
        :items="taskRailItems"
        :active-id="activeTaskId"
        :label="t('geo.views.workspace')"
        @select="selectTask"
      />

      <GeoPanelFrame
        v-if="panelOpen"
        :title="activeTask.label"
        :eyebrow="`TASK · ${activeTask.id.toUpperCase()}`"
        :close-label="t('geo.tasks.closePanel')"
        @close="closePanel"
      >
        <MeasurementPanel
          v-if="activeTaskId === 'measurement'"
          :controller="measurementController"
          :title="t('geo.measurement.title')"
          :distance-label="t('geo.measurement.distance')"
          :area-label="t('geo.measurement.area')"
          :height-label="t('geo.measurement.height')"
          :unavailable-label="t('geo.measurement.unavailable')"
          :unit-label="t('geo.measurement.unit')"
          :unit-meters-label="t('geo.measurement.unitMeters')"
          :unit-kilometers-label="t('geo.measurement.unitKilometers')"
          :snap-label="t('geo.measurement.snap')"
          :start-label="t('geo.measurement.start')"
          :cancel-label="t('geo.measurement.cancel')"
          :clear-label="t('geo.measurement.clear')"
          :current-result-label="t('geo.measurement.currentResult')"
          :empty-result-label="t('geo.measurement.emptyResult')"
          :exit-hint-label="t('geo.measurement.exitHint')"
        />
        <GeoTaskOverview
          v-else
          :icon="activeTask.icon"
          :description="activeTask.description"
          :pending-label="t('geo.tasks.pending')"
        />
      </GeoPanelFrame>

      <GeoMapControls
        :label="t('geo.views.workspace')"
        :scene-mode="runtime.state.sceneMode"
        :fullscreen="runtime.state.fullscreen"
        :reset-label="t('geo.controls.resetCamera')"
        :mode2d-label="t('geo.controls.mode2d')"
        :mode3d-label="t('geo.controls.mode3d')"
        :fullscreen-label="t('geo.controls.fullscreen')"
        :exit-fullscreen-label="t('geo.controls.exitFullscreen')"
        @reset="runtime.resetCamera()"
        @toggle-mode="toggleSceneMode"
        @toggle-fullscreen="toggleFullscreen"
      />

      <GeoStatusBar
        :longitude="runtime.state.longitude"
        :latitude="runtime.state.latitude"
        :surface-height="runtime.state.surfaceHeight"
        :camera-height="runtime.state.cameraHeight"
        :fps="runtime.state.framesPerSecond"
        :hint="activeHint"
        :active="measurementController.state.status === 'measuring'"
        :longitude-label="t('geo.status.longitude')"
        :latitude-label="t('geo.status.latitude')"
        :height-label="t('geo.status.height')"
        :camera-label="t('geo.status.camera')"
        :fps-label="t('geo.status.fps')"
      />
    </template>

    <GeoLoadState
      v-if="runtime.state.status === 'idle' || runtime.state.status === 'mounting'"
      :title="t('geo.workspace.loading')"
      :detail="t('geo.workspace.loadingDetail')"
    />
    <GeoLoadState
      v-else-if="runtime.state.status === 'failed'"
      :title="t('geo.workspace.failed')"
      :detail="runtime.state.error || t('geo.workspace.webglHint')"
      :action-label="t('geo.workspace.retry')"
      @action="mountWorkspace"
    />
  </main>
</template>

<script setup lang="ts">
import { computed, markRaw, onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { useLocalization } from '@/foundation/modules/localization/localization'
import GeoLoadState from '../components/shell/GeoLoadState.vue'
import GeoMapControls from '../components/shell/GeoMapControls.vue'
import GeoPanelFrame from '../components/shell/GeoPanelFrame.vue'
import GeoStatusBar from '../components/shell/GeoStatusBar.vue'
import GeoTaskOverview from '../components/shell/GeoTaskOverview.vue'
import GeoToolRail, { type GeoTaskRailItem } from '../components/shell/GeoToolRail.vue'
import GeoTopBar from '../components/shell/GeoTopBar.vue'
import { provideGeoRuntime } from '../core/geo-context'
import { createGeoRuntime } from '../core/geo-runtime'
import MeasurementPanel from '../plugins/measurement/MeasurementPanel.vue'
import {
  createMeasurementController,
  type MeasurementController,
} from '../plugins/measurement/measurement.controller'

interface GeoTaskItem extends GeoTaskRailItem {
  description: string
}

const { t } = useLocalization()
const workspaceRoot = ref<HTMLElement>()
const mapContainer = ref<HTMLElement>()
const activeTaskId = ref('measurement')
const panelOpen = ref(true)
const measurementController = shallowRef<MeasurementController>()
const runtime = createGeoRuntime()
provideGeoRuntime(runtime)

const tasks = computed<readonly GeoTaskItem[]>(function geoTasks() {
  return [
    {
      id: 'data',
      label: t('geo.tasks.data'),
      icon: 'database',
      description: t('geo.tasks.dataDescription'),
    },
    {
      id: 'view',
      label: t('geo.tasks.view'),
      icon: 'monitor',
      description: t('geo.tasks.viewDescription'),
    },
    {
      id: 'scene',
      label: t('geo.tasks.scene'),
      icon: 'layers',
      description: t('geo.tasks.sceneDescription'),
    },
    {
      id: 'drawing',
      label: t('geo.tasks.drawing'),
      icon: 'edit',
      description: t('geo.tasks.drawingDescription'),
    },
    {
      id: 'measurement',
      label: t('geo.tasks.measurement'),
      icon: 'map-pin',
      description: t('geo.measurement.idleHint'),
    },
    {
      id: 'analysis',
      label: t('geo.tasks.analysis'),
      icon: 'chart',
      description: t('geo.tasks.analysisDescription'),
    },
  ]
})
const taskRailItems = computed<readonly GeoTaskRailItem[]>(function railItems() {
  return tasks.value.map(function toRailItem(task) {
    return { id: task.id, label: task.label, icon: task.icon }
  })
})
const activeTask = computed<GeoTaskItem>(function currentTask() {
  return tasks.value.find((task) => task.id === activeTaskId.value) ?? tasks.value[0]
})
const activeHint = computed(function currentHint() {
  if (activeTaskId.value !== 'measurement' || !measurementController.value) {
    return activeTask.value.description
  }
  if (measurementController.value.state.status === 'measuring') {
    return t('geo.measurement.activeHint')
  }
  if (measurementController.value.state.status === 'complete') {
    return t('geo.measurement.completeHint')
  }
  return t('geo.measurement.idleHint')
})

async function mountWorkspace(): Promise<void> {
  const container = mapContainer.value
  if (!container) {
    return
  }
  measurementController.value?.dispose()
  measurementController.value = undefined
  try {
    await runtime.mount(container)
    measurementController.value = markRaw(
      createMeasurementController(runtime.viewerAccess.require(), runtime.interactions),
    )
  } catch {
    // GeoRuntime owns the diagnosable failure state rendered above.
  }
}

function selectTask(id: string): void {
  if (activeTaskId.value === id) {
    panelOpen.value = !panelOpen.value
    return
  }
  measurementController.value?.cancel()
  activeTaskId.value = id
  panelOpen.value = true
}

function closePanel(): void {
  measurementController.value?.cancel()
  panelOpen.value = false
}

function toggleSceneMode(): void {
  runtime.setSceneMode(runtime.state.sceneMode === '3d' ? '2d' : '3d')
}

async function toggleFullscreen(): Promise<void> {
  const target = workspaceRoot.value
  if (target) {
    await runtime.toggleFullscreen(target)
  }
}

function handleEscape(event: KeyboardEvent): void {
  if (event.key !== 'Escape') {
    return
  }
  if (measurementController.value?.state.status === 'measuring') {
    measurementController.value.cancel()
    return
  }
  panelOpen.value = false
}

onMounted(function mountGeoPage() {
  window.addEventListener('keydown', handleEscape)
  void mountWorkspace()
})

onBeforeUnmount(function disposeGeoPage() {
  window.removeEventListener('keydown', handleEscape)
  measurementController.value?.dispose()
  runtime.dispose()
})
</script>

<style scoped>
.geo-workspace {
  --geo-accent: #49c9ff;
  --geo-accent-deep: #268fd9;
  --geo-text: #eef7fc;
  --geo-text-soft: rgba(226, 240, 248, 0.78);
  --geo-text-faint: rgba(215, 231, 240, 0.52);
  --geo-line: rgba(195, 221, 235, 0.13);
  --geo-line-strong: rgba(195, 221, 235, 0.22);
  --geo-surface: rgba(7, 16, 26, 0.88);
  --geo-surface-strong: rgba(6, 14, 23, 0.91);
  --geo-surface-hover: rgba(173, 218, 241, 0.09);
  --geo-shadow: 0 20px 54px rgba(0, 5, 10, 0.4);
  position: fixed;
  z-index: 0;
  inset: 0;
  overflow: hidden;
  color: var(--geo-text);
  background: #07111c;
  isolation: isolate;
}

.geo-map-host,
.geo-map-atmosphere {
  position: absolute;
  inset: 0;
}

.geo-map-host {
  background: radial-gradient(circle at 58% 38%, rgba(32, 90, 130, 0.4), transparent 30%), #07111c;
}

.geo-map-atmosphere {
  z-index: 5;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(2, 8, 14, 0.18), transparent 22% 74%, rgba(2, 7, 12, 0.36)),
    radial-gradient(circle at 50% 45%, transparent 48%, rgba(1, 6, 11, 0.24) 100%);
}

.geo-map-host--crosshair :global(canvas) {
  cursor: crosshair !important;
}

.geo-workspace :global(.cesium-viewer),
.geo-workspace :global(.cesium-viewer-cesiumWidgetContainer),
.geo-workspace :global(.cesium-widget),
.geo-workspace :global(.cesium-widget canvas) {
  width: 100%;
  height: 100%;
}

.geo-workspace :global(.cesium-viewer-bottom) {
  right: 26px;
  bottom: 66px;
  left: auto;
}

.geo-workspace :global(.cesium-widget-credits) {
  border-radius: 5px;
  background: rgba(4, 10, 16, 0.62);
  backdrop-filter: blur(6px);
}

@media (max-width: 760px) {
  .geo-workspace :global(.cesium-viewer-bottom) {
    right: 14px;
    bottom: 132px;
  }
}
</style>
