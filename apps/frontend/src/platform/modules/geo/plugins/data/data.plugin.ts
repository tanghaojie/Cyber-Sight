import { defineComponent, h } from 'vue'
import DataPanel from './DataPanel.vue'
import type { GeoPluginDefinition, GeoPluginContext } from '../../core/geo-plugin'
import {
  activeTilesetCapability,
  createActiveTilesetCapability,
  imageryLayerNamesCapability,
} from './data.capabilities'
import {
  createGeoDataController,
  type GeoDataController,
  type GeoDataControllerOptions,
} from './data.controller'

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

export function createGeoDataPlugin(options: GeoDataControllerOptions = {}): GeoPluginDefinition {
  const pluginOptions: GeoDataControllerOptions = {
    ...options,
    tiandituToken:
      options.tiandituToken ?? (import.meta.env.VITE_GEO_TIANDITU_TOKEN as string | undefined),
  }
  return {
    id: 'data',
    order: 10,
    async install(context: GeoPluginContext) {
      const activeTileset = createActiveTilesetCapability()
      context.capabilities.provide(activeTilesetCapability, activeTileset, context.scope)
      const controller = createGeoDataController(context.viewer, {
        ...pluginOptions,
        signal: context.signal,
        onActiveTilesetChange: activeTileset.setCurrent,
      })
      context.scope.use(controller)
      context.capabilities.provide(
        imageryLayerNamesCapability,
        {
          getName(index: number) {
            return controller.state.imagery.find((layer) => layer.index === index)?.label
          },
        },
        context.scope,
      )
      if (!context.signal.aborted && !context.viewer.isDestroyed()) {
        const defaultSourceId = pluginOptions.tiandituToken?.trim()
          ? 'tianditu-image'
          : 'natural-earth-ii'
        await controller.addImagery(defaultSourceId)
        if (defaultSourceId === 'tianditu-image') {
          await controller.addImagery('tianditu-image-annotation')
        }
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
