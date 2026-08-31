import { reactive, readonly, type DeepReadonly } from 'vue'
import type { SimulatedFlightLayer } from '../../tools/flight/simulated-flight-layer'

export interface GeoFlightState {
  enabled: boolean
  aircraftCount: number
}

export interface GeoFlightController {
  readonly state: DeepReadonly<GeoFlightState>
  setEnabled(enabled: boolean): void
  reset(): void
  dispose(): void
}

export function createGeoFlightController(layer: SimulatedFlightLayer): GeoFlightController {
  const state = reactive<GeoFlightState>({
    enabled: false,
    aircraftCount: 0,
  })
  let disposed = false

  function setEnabled(enabled: boolean): void {
    if (disposed || state.enabled === enabled) {
      return
    }
    state.enabled = enabled
    state.aircraftCount = enabled ? layer.show() : 0
    if (!enabled) {
      layer.clear()
    }
  }

  function reset(): void {
    if (!disposed && state.enabled) {
      state.aircraftCount = layer.show()
    }
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    layer.dispose()
    state.enabled = false
    state.aircraftCount = 0
    disposed = true
  }

  return {
    state: readonly(state),
    setEnabled,
    reset,
    dispose,
  }
}
