<template>
  <main ref="workspaceRoot" class="geo-workspace" :aria-label="t('geo.views.workspace')">
    <div
      ref="mapContainer"
      class="geo-map-host"
      :class="{ 'geo-map-host--crosshair': runtime.interactions.state.cursor === 'crosshair' }"
    />
    <div class="geo-map-atmosphere" aria-hidden="true" />

    <template v-if="runtime.state.status === 'ready'">
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
        <component :is="activePanelComponent" v-if="activePanelComponent" />
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

      <GeoInspectorFrame
        v-if="activeInspectorComponent"
        :title="t('geo.inspector.title')"
        eyebrow="SELECTION"
      >
        <component :is="activeInspectorComponent" />
      </GeoInspectorFrame>

      <GeoPluginErrors :title="t('geo.plugins.errors')" :errors="runtime.plugins.state.errors" />

      <GeoStatusBar
        :longitude="runtime.state.longitude"
        :latitude="runtime.state.latitude"
        :surface-height="runtime.state.surfaceHeight"
        :camera-height="runtime.state.cameraHeight"
        :fps="runtime.state.framesPerSecond"
        :hint="activeHint"
        :active="Boolean(runtime.interactions.state.activeId)"
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
import { computed, onBeforeUnmount, onMounted, ref, type Component } from 'vue'
import { useLocalization } from '@/foundation/modules/localization/localization'
import GeoLoadState from '../components/shell/GeoLoadState.vue'
import GeoInspectorFrame from '../components/shell/GeoInspectorFrame.vue'
import GeoMapControls from '../components/shell/GeoMapControls.vue'
import GeoPanelFrame from '../components/shell/GeoPanelFrame.vue'
import GeoPluginErrors from '../components/shell/GeoPluginErrors.vue'
import GeoStatusBar from '../components/shell/GeoStatusBar.vue'
import GeoTaskOverview from '../components/shell/GeoTaskOverview.vue'
import GeoToolRail, { type GeoTaskRailItem } from '../components/shell/GeoToolRail.vue'
import GeoTopBar from '../components/shell/GeoTopBar.vue'
import { provideGeoRuntime } from '../core/geo-context'
import type {
  GeoInspectorContribution,
  GeoPanelContribution,
  GeoTaskGroupContribution,
  GeoToolContribution,
} from '../core/geo-plugin'
import { createGeoRuntime } from '../core/geo-runtime'
import { geoPlugins } from '../geo.plugins'

interface GeoTaskItem extends GeoTaskRailItem {
  description: string
}

const { t } = useLocalization()
const workspaceRoot = ref<HTMLElement>()
const mapContainer = ref<HTMLElement>()
const activeTaskId = ref('data')
const panelOpen = ref(true)
const runtime = createGeoRuntime({ plugins: geoPlugins })
provideGeoRuntime(runtime)

const taskDefinitions = computed<readonly GeoTaskItem[]>(function taskMetadata() {
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
      id: 'model',
      label: t('geo.tasks.model'),
      icon: 'grid',
      description: t('geo.tasks.modelDescription'),
    },
    {
      id: 'terrain',
      label: t('geo.tasks.terrain'),
      icon: 'chart',
      description: t('geo.tasks.terrainDescription'),
    },
    {
      id: 'compare',
      label: t('geo.tasks.compare'),
      icon: 'panel',
      description: t('geo.tasks.compareDescription'),
    },
  ]
})

const tasks = computed<readonly GeoTaskItem[]>(function geoTasks() {
  const installedGroupIds = new Set(
    runtime.plugins
      .getContributions('group')
      .map((entry) => (entry.contribution as GeoTaskGroupContribution).id),
  )
  return taskDefinitions.value.filter((task) => installedGroupIds.has(task.id))
})
const taskRailItems = computed<readonly GeoTaskRailItem[]>(function railItems() {
  return tasks.value.map(function toRailItem(task) {
    return { id: task.id, label: task.label, icon: task.icon }
  })
})
const activeTask = computed<GeoTaskItem>(function currentTask() {
  return (
    tasks.value.find((task) => task.id === activeTaskId.value) ??
    tasks.value[0] ??
    taskDefinitions.value[0]
  )
})
const activePanelComponent = computed<Component | undefined>(function currentPanelComponent() {
  const activePanelId = runtime.plugins.state.activePanelId
  if (!panelOpen.value || !activePanelId) {
    return undefined
  }
  const entry = runtime.plugins.getContribution(activePanelId)
  if (!entry || entry.kind !== 'panel') {
    return undefined
  }
  return (entry.contribution as GeoPanelContribution).component as Component
})
const activeInspectorComponent = computed<Component | undefined>(
  function currentInspectorComponent() {
    const entry = runtime.plugins.getContributions('inspector').find(function findInspector(item) {
      return (item.contribution as GeoInspectorContribution).matches(undefined)
    })
    return entry ? (entry.contribution as GeoInspectorContribution).component : undefined
  },
)
const activeHint = computed(function currentHint() {
  if (runtime.interactions.state.activeId) {
    return `${t('geo.status.activeTool')} · ${runtime.interactions.state.activeId}`
  }
  return activeTask.value.description
})

async function mountWorkspace(): Promise<void> {
  const container = mapContainer.value
  if (!container) {
    return
  }
  try {
    await runtime.mount(container)
    if (!tasks.value.some((task) => task.id === activeTaskId.value)) {
      activeTaskId.value = tasks.value[0]?.id ?? 'data'
    }
    openTaskPanel(activeTaskId.value)
  } catch {
    // GeoRuntime owns the diagnosable failure state rendered above.
  }
}

function selectTask(id: string): void {
  if (activeTaskId.value === id) {
    panelOpen.value = !panelOpen.value
    if (panelOpen.value) {
      openTaskPanel(id)
    } else {
      runtime.plugins.setActivePanel(undefined)
    }
    return
  }
  runtime.interactions.cancel('switch')
  activeTaskId.value = id
  panelOpen.value = true
  openTaskPanel(id)
}

function openTaskPanel(groupId: string): void {
  const panelTool = runtime.plugins.getContributions('tool').find(function findPanelTool(entry) {
    const contribution = entry.contribution as GeoToolContribution
    return contribution.kind === 'panel' && contribution.groupId === groupId
  })
  if (!panelTool) {
    runtime.plugins.setActivePanel(undefined)
    return
  }
  void runtime.plugins.executeTool(panelTool.id)
}

function closePanel(): void {
  runtime.interactions.cancel('cancel')
  runtime.plugins.setActivePanel(undefined)
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
  if (runtime.interactions.state.activeId) {
    runtime.interactions.cancel('cancel')
    return
  }
  runtime.plugins.setActivePanel(undefined)
  panelOpen.value = false
}

onMounted(function mountGeoPage() {
  window.addEventListener('keydown', handleEscape)
  void mountWorkspace()
})

onBeforeUnmount(function disposeGeoPage() {
  window.removeEventListener('keydown', handleEscape)
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

.geo-map-host :global(canvas) {
  cursor: grab !important;
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
