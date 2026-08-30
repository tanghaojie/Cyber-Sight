import { defineComponent, h } from 'vue'
import type { GeoPluginDefinition, GeoPluginContext } from '../../core/geo-plugin'
import {
  geoSolarLightingCapability,
  type GeoSolarLightingCapability,
} from '../scene/scene.capabilities'
import TimeDock from './TimeDock.vue'
import { createGeoTimeController, type GeoTimeController } from './time.controller'

function dockFor(controller: GeoTimeController, solarLighting: GeoSolarLightingCapability) {
  return defineComponent({
    name: 'GeoTimePluginDock',
    setup() {
      return () => h(TimeDock, { controller, solarLighting })
    },
  })
}

export function createGeoTimePlugin(): GeoPluginDefinition {
  return {
    id: 'time',
    order: 35,
    requires: ['scene'],
    install(context: GeoPluginContext) {
      const controller = createGeoTimeController(context.viewer)
      context.scope.use(controller)
      const solarLighting = context.capabilities.require(geoSolarLightingCapability)
      return {
        contributions: {
          bottomDocks: [
            {
              id: 'timeline',
              labelKey: 'geo.time.timeline',
              component: dockFor(controller, solarLighting),
              order: 10,
            },
          ],
        },
        dispose() {},
      }
    },
  }
}

export const geoTimePlugin: GeoPluginDefinition = createGeoTimePlugin()
