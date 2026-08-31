import { defineComponent, h } from 'vue'
import type { GeoPluginDefinition, GeoPluginContext } from '../../core/geo-plugin'
import { createOpenSkyFlightLayer } from '../../tools/flight/open-sky-flight-layer'
import FlightPanel from './FlightPanel.vue'
import { createGeoFlightController, type GeoFlightController } from './flight.controller'

function panelFor(controller: GeoFlightController) {
  return defineComponent({
    name: 'GeoFlightPluginPanel',
    setup() {
      return () => h(FlightPanel, { controller })
    },
  })
}

export const geoFlightPlugin: GeoPluginDefinition = {
  id: 'flight',
  order: 38,
  async install(context: GeoPluginContext) {
    const layer = await createOpenSkyFlightLayer(context.viewer)
    if (context.signal.aborted) {
      layer.dispose()
      throw new DOMException('Geo flight plugin installation was aborted', 'AbortError')
    }

    const controller = createGeoFlightController(context.viewer, layer)
    context.scope.use(controller)
    return {
      contributions: {
        groups: [
          {
            id: 'flight',
            label: '实时航班',
            labelKey: 'geo.tasks.flight',
            icon: 'activity',
            order: 38,
          },
        ],
        tools: [
          {
            id: 'open-panel',
            kind: 'panel',
            groupId: 'flight',
            panelId: 'flight.panel',
            label: '实时航班',
            labelKey: 'geo.flight.title',
            icon: 'activity',
          },
        ],
        panels: [
          {
            id: 'panel',
            panelId: 'flight.panel',
            component: panelFor(controller),
            groupId: 'flight',
          },
        ],
      },
      dispose() {},
    }
  },
}
