import { markRaw, reactive, shallowReadonly } from 'vue'
import { Cartesian3, Color, type TerrainProvider, type Viewer } from 'cesium'
import type { Disposable } from '../../core/disposable'
import {
  TerrainAnalysisTool,
  type TerrainAnalysisSession,
  type TerrainColorMode,
  type TerrainSample,
} from '../../tools/terrain/terrain-analysis'

export type TerrainStatus = 'idle' | 'running' | 'complete' | 'failed'

export interface TerrainState {
  status: TerrainStatus
  progress: number
  sampled: TerrainSample[]
  contourCount: number
  colorMode?: TerrainColorMode
  error?: string
}

export interface TerrainController extends Disposable {
  readonly state: Readonly<TerrainState>
  sample(positions: readonly Cartesian3[]): Promise<void>
  startFlood(positions: readonly Cartesian3[], waterHeight: number, durationMs?: number): void
  createContours(positions: readonly Cartesian3[], interval?: number): Promise<void>
  setTerrainColorMode(mode: TerrainColorMode): void
  clearTerrainColorMode(): void
  cancel(): void
  clear(): void
}

export function createTerrainController(
  viewer: Viewer,
  terrainProvider?: TerrainProvider,
): TerrainController {
  const tool = markRaw(new TerrainAnalysisTool(viewer, terrainProvider))
  const state = reactive<TerrainState>({
    status: 'idle',
    progress: 0,
    sampled: [],
    contourCount: 0,
  })
  let operation: AbortController | undefined
  let floodSession: TerrainAnalysisSession | undefined

  async function sample(positions: readonly Cartesian3[]): Promise<void> {
    cancel()
    const request = new AbortController()
    operation = request
    state.status = 'running'
    state.progress = 0
    state.error = undefined
    try {
      state.sampled = await tool.sample(positions, {
        signal: request.signal,
        onProgress(completed, total) {
          state.progress = total ? completed / total : 1
        },
      })
      if (operation !== request || request.signal.aborted) {
        return
      }
      state.status = 'complete'
      state.progress = 1
    } catch (error) {
      if (operation !== request) {
        return
      }
      if (request.signal.aborted) {
        state.status = 'idle'
        return
      }
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Terrain sampling failed'
    } finally {
      if (operation === request) {
        operation = undefined
      }
    }
  }

  function startFlood(positions: readonly Cartesian3[], waterHeight: number, durationMs = 0): void {
    cancel()
    state.status = 'running'
    state.progress = 0
    state.error = undefined
    try {
      floodSession = tool.startFlood(positions, {
        waterHeight,
        durationMs,
        color: Color.fromCssColorString('#3a9dff'),
        onProgress(currentHeight) {
          state.progress = waterHeight === 0 ? 1 : Math.min(currentHeight / waterHeight, 1)
          if (state.progress >= 1) {
            state.status = 'complete'
          }
        },
      })
    } catch (error) {
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Flood analysis failed'
    }
  }

  async function createContours(positions: readonly Cartesian3[], interval = 25): Promise<void> {
    cancel()
    const request = new AbortController()
    operation = request
    state.status = 'running'
    state.progress = 0
    state.error = undefined
    try {
      const entities = await tool.createContours(positions, {
        signal: request.signal,
        interval,
      })
      if (operation !== request || request.signal.aborted) {
        tool.removeEntities(entities)
        return
      }
      state.contourCount = entities.length
      state.status = 'complete'
      state.progress = 1
    } catch (error) {
      if (operation !== request) {
        return
      }
      if (request.signal.aborted) {
        state.status = 'idle'
        return
      }
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Contour generation failed'
    } finally {
      if (operation === request) {
        operation = undefined
      }
    }
  }

  function setTerrainColorMode(mode: TerrainColorMode): void {
    try {
      tool.setTerrainColorMode(mode)
      state.colorMode = mode
    } catch (error) {
      state.status = 'failed'
      state.error = error instanceof Error ? error.message : 'Terrain coloring failed'
    }
  }

  function clearTerrainColorMode(): void {
    tool.clearTerrainColorMode()
    state.colorMode = undefined
  }

  function cancel(): void {
    operation?.abort()
    operation = undefined
    floodSession?.stop()
    floodSession = undefined
    tool.stop()
    if (state.status === 'running') {
      state.status = 'idle'
      state.progress = 0
    }
  }

  function clear(): void {
    cancel()
    tool.clear()
    state.sampled = []
    state.contourCount = 0
    state.progress = 0
    state.colorMode = undefined
    state.status = 'idle'
    state.error = undefined
  }

  function dispose(): void {
    cancel()
    tool.dispose()
  }

  return {
    state: shallowReadonly(state),
    sample,
    startFlood,
    createContours,
    setTerrainColorMode,
    clearTerrainColorMode,
    cancel,
    clear,
    dispose,
  }
}
