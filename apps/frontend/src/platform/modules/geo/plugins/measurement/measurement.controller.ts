import { markRaw, reactive, shallowReadonly } from 'vue'
import type { Viewer } from 'cesium'
import type { Disposable } from '../../core/disposable'
import type { GeoInteractionManager } from '../../core/interaction-manager'
import { DistanceMeasurementTool } from '../../tools/measurement/distance-measurement'
import {
  AreaMeasurementTool,
  PointMeasurementTool,
  type AreaMeasurement,
  type PointMeasurement,
} from '../../tools/measurement/measurement-tools'

export type MeasurementStatus = 'idle' | 'measuring' | 'complete' | 'failed'
export type MeasurementMode = 'point' | 'distance' | 'area'

export interface MeasurementState {
  status: MeasurementStatus
  mode?: MeasurementMode
  resultMeters?: number
  resultSquareMeters?: number
  point?: PointMeasurement
  error?: string
}

export interface MeasurementController extends Disposable {
  readonly state: Readonly<MeasurementState>
  startPoint(): void
  startDistance(): void
  startArea(): void
  cancel(): void
  clearCurrent(): void
  clearAll(): void
  clear(): void
}

const POINT_INTERACTION_ID = 'measurement.point'
const DISTANCE_INTERACTION_ID = 'measurement.distance'
const AREA_INTERACTION_ID = 'measurement.area'

export function createMeasurementController(
  viewer: Viewer,
  interactions: GeoInteractionManager,
): MeasurementController {
  const tool = markRaw(new DistanceMeasurementTool(viewer))
  const pointTool = markRaw(new PointMeasurementTool(viewer))
  const areaTool = markRaw(new AreaMeasurementTool(viewer))
  const state = reactive<MeasurementState>({ status: 'idle' })

  function resetResult(): void {
    state.resultMeters = undefined
    state.resultSquareMeters = undefined
    state.point = undefined
  }

  function startPoint(): void {
    state.status = 'measuring'
    state.mode = 'point'
    state.error = undefined
    resetResult()
    try {
      interactions.activate({
        id: POINT_INTERACTION_ID,
        cursor: 'crosshair',
        start(interactionContext) {
          return pointTool.start({
            signal: interactionContext.signal,
            onComplete(point) {
              state.point = point
              state.status = 'complete'
              interactionContext.complete()
            },
            onCancel() {
              if (state.status === 'measuring') {
                state.status = 'idle'
              }
            },
          })
        },
      })
      state.status = 'measuring'
      state.mode = 'point'
    } catch (error) {
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Point measurement failed'
    }
  }

  function startDistance(): void {
    state.status = 'measuring'
    state.mode = 'distance'
    state.error = undefined
    resetResult()
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
            onCancel() {
              if (state.status === 'measuring') {
                state.status = 'idle'
                resetResult()
              }
            },
          })
        },
      })
      state.status = 'measuring'
      state.mode = 'distance'
    } catch (error) {
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Distance measurement failed'
    }
  }

  function startArea(): void {
    state.status = 'measuring'
    state.mode = 'area'
    state.error = undefined
    resetResult()
    try {
      interactions.activate({
        id: AREA_INTERACTION_ID,
        cursor: 'crosshair',
        start(interactionContext) {
          return areaTool.start({
            signal: interactionContext.signal,
            onUpdate(areaSquareMeters) {
              state.resultSquareMeters = areaSquareMeters
            },
            onComplete(result: AreaMeasurement) {
              state.resultSquareMeters = result.areaSquareMeters
              state.status = 'complete'
              interactionContext.complete()
            },
            onCancel() {
              if (state.status === 'measuring') {
                state.status = 'idle'
              }
            },
          })
        },
      })
      state.status = 'measuring'
      state.mode = 'area'
    } catch (error) {
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Area measurement failed'
    }
  }

  function cancel(): void {
    if (
      interactions.state.activeId === POINT_INTERACTION_ID ||
      interactions.state.activeId === DISTANCE_INTERACTION_ID ||
      interactions.state.activeId === AREA_INTERACTION_ID
    ) {
      interactions.cancel()
    }
    if (state.status === 'measuring') {
      state.status = 'idle'
      resetResult()
    }
  }

  function clearCurrent(): void {
    cancel()
    if (state.mode === 'point') {
      pointTool.clear()
    } else if (state.mode === 'area') {
      areaTool.clear()
    } else {
      tool.clear()
    }
    resetResult()
    state.status = 'idle'
  }

  function clearAll(): void {
    cancel()
    tool.clear()
    pointTool.clear()
    areaTool.clear()
    resetResult()
    state.status = 'idle'
    state.error = undefined
  }

  function clear(): void {
    clearAll()
  }

  function dispose(): void {
    cancel()
    tool.dispose()
    pointTool.dispose()
    areaTool.dispose()
  }

  return {
    state: shallowReadonly(state),
    startPoint,
    startDistance,
    startArea,
    cancel,
    clearCurrent,
    clearAll,
    clear,
    dispose,
  }
}
