import { markRaw, reactive, shallowReadonly } from 'vue'
import {
  Cartesian3,
  Color,
  EllipsoidTerrainProvider,
  type TerrainProvider,
  type Viewer,
} from 'cesium'
import type { Disposable } from '../../core/disposable'
import {
  TerrainAnalysisTool,
  type TerrainAnalysisSession,
  type TerrainColorMode,
  type TerrainSample,
} from '../../tools/terrain/terrain-analysis'

export type TerrainStatus = 'idle' | 'running' | 'complete' | 'failed'

const TERRAIN_REQUIRED_MESSAGE = '当前未加载地形，等高线无法使用。请先到数据面板加载地形。'

export interface TerrainState {
  status: TerrainStatus
  progress: number
  sampled: TerrainSample[]
  terrainAvailable: boolean
  contourInterval: number
  colorMode?: TerrainColorMode
  error?: string
}

export interface TerrainController extends Disposable {
  readonly state: Readonly<TerrainState>
  sample(positions: readonly Cartesian3[]): Promise<void>
  startFlood(positions: readonly Cartesian3[], waterHeight: number, durationMs?: number): void
  setContour(interval?: number): void
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
    terrainAvailable: !(viewer.scene.globe.terrainProvider instanceof EllipsoidTerrainProvider),
    contourInterval: 100,
  })
  let operation: AbortController | undefined
  let floodSession: TerrainAnalysisSession | undefined

  function captureTerrainProvider(provider: TerrainProvider): void {
    state.terrainAvailable = !(provider instanceof EllipsoidTerrainProvider)
    if (state.terrainAvailable && state.error === TERRAIN_REQUIRED_MESSAGE) {
      state.status = 'idle'
      state.error = undefined
    }
    if (!state.terrainAvailable && state.colorMode === 'contour') {
      tool.clearTerrainColorMode()
      state.colorMode = undefined
    }
  }

  const removeTerrainProviderChanged =
    viewer.scene.globe.terrainProviderChanged.addEventListener(captureTerrainProvider)

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

  function setContour(interval = 100): void {
    if (!state.terrainAvailable) {
      state.status = 'failed'
      state.error = TERRAIN_REQUIRED_MESSAGE
      return
    }
    const boundedInterval = Math.min(Math.max(interval, 1), 10_000)
    state.contourInterval = boundedInterval
    setTerrainColorMode('contour')
  }

  function setTerrainColorMode(mode: TerrainColorMode): void {
    try {
      tool.setTerrainColorMode(mode, state.contourInterval)
      state.colorMode = mode
      if (state.status !== 'running') {
        state.status = 'idle'
      }
      state.error = undefined
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
    state.progress = 0
    state.colorMode = undefined
    state.status = 'idle'
    state.error = undefined
  }

  function dispose(): void {
    cancel()
    removeTerrainProviderChanged()
    tool.dispose()
  }

  return {
    state: shallowReadonly(state),
    sample,
    startFlood,
    setContour,
    setTerrainColorMode,
    clearTerrainColorMode,
    cancel,
    clear,
    dispose,
  }
}
