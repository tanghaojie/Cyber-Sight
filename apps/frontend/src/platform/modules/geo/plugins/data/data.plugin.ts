import { defineComponent, h } from 'vue'
import { DEFAULT_GEO_CAMERA_VIEW, setGeoCameraView } from '../../tools/view/camera-view'
import DataPanel from './DataPanel.vue'
import type { GeoPluginDefinition, GeoPluginContext } from '../../core/geo-plugin'
import {
  activeTilesetCapability,
  createActiveTilesetCapability,
  createImageryLayerCollectionCapability,
  imageryLayerCollectionCapability,
} from './data.capabilities'
import {
  createGeoDataController,
  type GeoDataController,
  type GeoDataControllerOptions,
} from './data.controller'
import {
  DEFAULT_GEO_TILESET_ID,
  DEFAULT_GEO_TILESET_LABEL,
  DEFAULT_GEO_TILESET_MAX_CAMERA_HEIGHT,
  DEFAULT_GEO_TILESET_URL,
} from '../../tools/data/data-presets'

export interface GeoDataPluginInstance {
  readonly id: 'data'
  readonly controller: GeoDataController
  readonly panel: typeof DataPanel
  dispose(): void
}

function panelFor(controller: GeoDataController) {
  return defineComponent({
    name: 'GeoDataPluginPanel',
    setup() {
      return () => h(DataPanel, { controller })
    },
  })
}

async function loadDefaultTileset(
  controller: GeoDataController,
  context: GeoPluginContext,
): Promise<void> {
  const loaded = await controller.loadTileset({
    id: DEFAULT_GEO_TILESET_ID,
    label: DEFAULT_GEO_TILESET_LABEL,
    url: DEFAULT_GEO_TILESET_URL,
    visualStyle: 'cyber-scan',
    maximumVisibleCameraHeight: DEFAULT_GEO_TILESET_MAX_CAMERA_HEIGHT,
  })
  if (!loaded || context.signal.aborted || context.viewer.isDestroyed()) {
    return
  }
  await controller.flyToResource(DEFAULT_GEO_TILESET_ID)
  if (!context.signal.aborted && !context.viewer.isDestroyed()) {
    setGeoCameraView(context.viewer, DEFAULT_GEO_CAMERA_VIEW)
  }
}

export function createGeoDataPlugin(options: GeoDataControllerOptions = {}): GeoPluginDefinition {
  const pluginOptions: GeoDataControllerOptions = {
    ...options,
    coordinateCorrection: options.coordinateCorrection ?? 'auto',
    tiandituToken:
      options.tiandituToken ?? (import.meta.env.VITE_GEO_TIANDITU_TOKEN as string | undefined),
  }
  return {
    id: 'data',
    order: 10,
    async install(context: GeoPluginContext) {
      const activeTileset = createActiveTilesetCapability()
      const imageryLayers = createImageryLayerCollectionCapability()
      context.capabilities.provide(activeTilesetCapability, activeTileset, context.scope)
      context.capabilities.provide(imageryLayerCollectionCapability, imageryLayers, context.scope)
      const controller = createGeoDataController(context.viewer, {
        ...pluginOptions,
        signal: context.signal,
        onActiveTilesetChange: activeTileset.setCurrent,
        onImageryLayersChange: imageryLayers.setLayers,
      })
      context.scope.use(controller)
      if (!context.signal.aborted && !context.viewer.isDestroyed()) {
        await controller.addImagery('google-hybrid')
      }
      if (!context.signal.aborted && !context.viewer.isDestroyed()) {
        void loadDefaultTileset(controller, context)
      }
      const instance: GeoDataPluginInstance = {
        id: 'data',
        controller,
        panel: DataPanel,
        dispose() {},
      }
      return {
        contributions: {
          groups: [{ id: 'data', label: '数据', icon: 'database', order: 10 }],
          tools: [
            {
              id: 'data-browser',
              kind: 'panel',
              panelId: 'data.panel',
              groupId: 'data',
              label: '数据浏览器',
              icon: 'database',
              order: 10,
            },
          ],
          panels: [
            {
              id: 'panel',
              panelId: 'data.panel',
              component: panelFor(controller),
              groupId: 'data',
            },
          ],
        },
        dispose: instance.dispose,
      }
    },
  }
}

export const geoDataPlugin: GeoPluginDefinition = createGeoDataPlugin()
