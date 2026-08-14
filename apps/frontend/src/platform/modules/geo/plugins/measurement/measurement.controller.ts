import { markRaw, reactive, readonly } from 'vue'
import type { Viewer } from 'cesium'
import type { Disposable } from '../../core/disposable'
import type { GeoInteractionManager } from '../../core/interaction-manager'
import { DistanceMeasurementTool } from '../../tools/measurement/distance-measurement'

export type MeasurementStatus = 'idle' | 'measuring' | 'complete' | 'failed'

export interface MeasurementState {
  status: MeasurementStatus
  resultMeters?: number
  error?: string
}

export interface MeasurementController extends Disposable {
  readonly state: Readonly<MeasurementState>
  startDistance(): void
  cancel(): void
  clear(): void
}

const DISTANCE_INTERACTION_ID = 'measurement.distance'

export function createMeasurementController(
  viewer: Viewer,
  interactions: GeoInteractionManager,
): MeasurementController {
  const tool = markRaw(new DistanceMeasurementTool(viewer))
  const state = reactive<MeasurementState>({ status: 'idle' })

  function startDistance(): void {
    state.status = 'measuring'
    state.error = undefined
    state.resultMeters = undefined
    try {
      interactions.activate({
        id: DISTANCE_INTERACTION_ID,
        cursor: 'crosshair',
        start(interactionContext) {
          return tool.startDistance({
            signal: interactionContext.signal,
            onUpdate(distanceMeters) {
              state.resultMeters = distanceMeters
            },
            onComplete(distanceMeters) {
              state.resultMeters = distanceMeters
              state.status = 'complete'
              interactionContext.complete()
            },
          })
        },
      })
    } catch (error) {
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Distance measurement failed'
    }
  }

  function cancel(): void {
    if (interactions.state.activeId === DISTANCE_INTERACTION_ID) {
      interactions.cancel()
    }
    if (state.status === 'measuring') {
      state.status = 'idle'
      state.resultMeters = undefined
    }
  }

  function clear(): void {
    cancel()
    tool.clear()
    state.status = 'idle'
    state.resultMeters = undefined
    state.error = undefined
  }

  function dispose(): void {
    cancel()
    tool.dispose()
  }

  return {
    state: readonly(state),
    startDistance,
    cancel,
    clear,
    dispose,
  }
}
