import { reactive, readonly, type DeepReadonly } from 'vue'
import { Math as CesiumMath, type Viewer } from 'cesium'
import {
  GEO_OPEN_SKY_MAX_VIEWPORT_AREA,
  type GeoOpenSkyStatesData,
  type GeoOpenSkyStatesQuery,
} from '@cyber-ai-forge/api-contract'
import { fetchGeoOpenSkyStates } from '../../geo.api'
import type { OpenSkyFlightLayer } from '../../tools/flight/open-sky-flight-layer'

const REFRESH_INTERVAL_MS = 30_000
const MAX_AIRCRAFT = 600

export interface GeoFlightState {
  enabled: boolean
  loading: boolean
  aircraftCount: number
  lastUpdatedAt?: string
  sourceTime?: number
  rateLimitRemaining: number | null
  viewport?: string
  error?: string
}

export interface GeoFlightController {
  readonly state: DeepReadonly<GeoFlightState>
  setEnabled(enabled: boolean): void
  refresh(): Promise<void>
  dispose(): void
}

type OpenSkyStatesRequest = (
  query: GeoOpenSkyStatesQuery,
  signal?: AbortSignal,
) => Promise<GeoOpenSkyStatesData>

function roundCoordinate(value: number): number {
  return Math.round(value * 10_000) / 10_000
}

function viewportQuery(viewer: Viewer): GeoOpenSkyStatesQuery {
  const rectangle = viewer.camera.computeViewRectangle(viewer.scene.globe.ellipsoid)
  if (!rectangle) {
    throw new Error('当前视野无法投影到地球表面，请先复位相机')
  }

  const query = {
    lamin: roundCoordinate(CesiumMath.toDegrees(rectangle.south)),
    lomin: roundCoordinate(CesiumMath.toDegrees(rectangle.west)),
    lamax: roundCoordinate(CesiumMath.toDegrees(rectangle.north)),
    lomax: roundCoordinate(CesiumMath.toDegrees(rectangle.east)),
  }
  if (query.lomin >= query.lomax) {
    throw new Error('当前视野跨越 180° 经线，请旋转地图后重试')
  }

  const area = (query.lamax - query.lamin) * (query.lomax - query.lomin)
  if (area > GEO_OPEN_SKY_MAX_VIEWPORT_AREA) {
    throw new Error('当前视域过大，请放大到区域范围后再加载实时航班')
  }
  return query
}

function viewportLabel(query: GeoOpenSkyStatesQuery): string {
  return `LAT ${query.lamin.toFixed(2)}°–${query.lamax.toFixed(2)}° · LON ${query.lomin.toFixed(2)}°–${query.lomax.toFixed(2)}°`
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

export function createGeoFlightController(
  viewer: Viewer,
  layer: OpenSkyFlightLayer,
  requestStates: OpenSkyStatesRequest = fetchGeoOpenSkyStates,
): GeoFlightController {
  const state = reactive<GeoFlightState>({
    enabled: false,
    loading: false,
    aircraftCount: 0,
    rateLimitRemaining: null,
  })
  let disposed = false
  let refreshTimer: ReturnType<typeof setInterval> | undefined
  let activeRequest: AbortController | undefined
  let requestVersion = 0

  function stopPolling(): void {
    if (refreshTimer !== undefined) {
      clearInterval(refreshTimer)
      refreshTimer = undefined
    }
  }

  function cancelRequest(): void {
    requestVersion += 1
    activeRequest?.abort()
    activeRequest = undefined
    state.loading = false
  }

  async function refresh(): Promise<void> {
    if (disposed || !state.enabled) {
      return
    }

    cancelRequest()
    const version = requestVersion
    const abortController = new AbortController()
    activeRequest = abortController
    state.loading = true
    state.error = undefined

    try {
      const query = viewportQuery(viewer)
      state.viewport = viewportLabel(query)
      const result = await requestStates(query, abortController.signal)
      if (
        disposed ||
        !state.enabled ||
        abortController.signal.aborted ||
        version !== requestVersion
      ) {
        return
      }

      const aircraft = result.aircraft.filter((item) => !item.onGround).slice(0, MAX_AIRCRAFT)
      state.aircraftCount = layer.update(aircraft, result.sourceTime)
      state.lastUpdatedAt = result.receivedAt
      state.sourceTime = result.sourceTime
      state.rateLimitRemaining = result.rateLimitRemaining
    } catch (error) {
      if (!isAbortError(error) && !abortController.signal.aborted && version === requestVersion) {
        state.error = error instanceof Error ? error.message : 'OpenSky 实时航班加载失败'
      }
    } finally {
      if (version === requestVersion) {
        activeRequest = undefined
        state.loading = false
      }
    }
  }

  function setEnabled(enabled: boolean): void {
    if (disposed || state.enabled === enabled) {
      return
    }
    state.enabled = enabled
    state.error = undefined
    if (!enabled) {
      stopPolling()
      cancelRequest()
      layer.clear()
      state.aircraftCount = 0
      state.lastUpdatedAt = undefined
      state.sourceTime = undefined
      state.rateLimitRemaining = null
      state.viewport = undefined
      return
    }

    void refresh()
    refreshTimer = setInterval(function refreshCurrentViewport() {
      void refresh()
    }, REFRESH_INTERVAL_MS)
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    stopPolling()
    cancelRequest()
    layer.dispose()
    disposed = true
  }

  return {
    state: readonly(state),
    setEnabled,
    refresh,
    dispose,
  }
}
