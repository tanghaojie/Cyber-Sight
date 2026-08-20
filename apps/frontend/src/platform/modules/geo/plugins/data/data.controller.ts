import { reactive, readonly, type DeepReadonly } from 'vue'
import type { Cesium3DTileset, Viewer } from 'cesium'
import {
  createGeoDataBrowser,
  type GeoDataBrowser,
  type GeoDataBrowserOptions,
  type GeoDataResourceSnapshot,
  type GeoTerrainResourceId,
  type GeoTerrainSnapshot,
  type LoadGeoJsonOptions,
  type LoadModelOptions,
  type LoadTilesetOptions,
} from '../../tools/data/data-browser'
import {
  createGeoImageryCatalog,
  type GeoImageryAvailability,
  type GeoImagerySourceId,
  type GeoImagerySourceOptions,
} from '../../tools/data/imagery-sources'
import {
  createGeoImageryLayerManager,
  type AddImageryLayerOptions,
  type GeoImageryLayerManager,
  type GeoImageryLayerSnapshot,
} from '../../tools/data/imagery-layer-manager'

export interface GeoDataState {
  imagery: readonly GeoImageryLayerSnapshot[]
  resources: readonly GeoDataResourceSnapshot[]
  terrain: GeoTerrainSnapshot
  busy: boolean
  loadingImagerySource?: GeoImagerySourceId
  error?: string
}

export interface GeoDataController {
  readonly state: DeepReadonly<GeoDataState>
  readonly imageryCatalog: ReturnType<typeof createGeoImageryCatalog>
  imageryAvailability(sourceId: GeoImagerySourceId): GeoImageryAvailability
  addImagery(sourceId: GeoImagerySourceId, options?: AddImageryLayerOptions): Promise<void>
  removeImagery(id: string): void
  setImageryVisible(id: string, show: boolean): void
  setImageryAlpha(id: string, alpha: number): void
  raiseImagery(id: string): void
  lowerImagery(id: string): void
  flyToImagery(id: string): void
  loadGeoJson(options: LoadGeoJsonOptions): Promise<void>
  loadModel(options: LoadModelOptions): Promise<void>
  loadTileset(options: LoadTilesetOptions): Promise<void>
  removeResource(id: string): void
  setResourceVisible(id: string, show: boolean): void
  flyToResource(id: string): Promise<void>
  setTerrain(id: GeoTerrainResourceId, url?: string): Promise<void>
  refresh(): void
  dispose(): void
}

export interface GeoDataControllerOptions extends GeoImagerySourceOptions {
  readonly catalog?: ReturnType<typeof createGeoImageryCatalog>
  readonly signal?: AbortSignal
  readonly onActiveTilesetChange?: (tileset: Cesium3DTileset | undefined) => void
}

export function createGeoDataController(
  viewer: Viewer,
  options: GeoDataControllerOptions = {},
): GeoDataController {
  const catalog = options.catalog ?? createGeoImageryCatalog()
  const browserOptions: GeoDataBrowserOptions = {
    signal: options.signal,
    onActiveTilesetChange: options.onActiveTilesetChange,
  }
  const browser: GeoDataBrowser = createGeoDataBrowser(viewer, browserOptions)
  const state = reactive<GeoDataState>({
    imagery: [],
    resources: [],
    terrain: browser.getTerrain(),
    busy: false,
  })
  let imagery: GeoImageryLayerManager
  let disposed = false

  function guard(): void {
    if (disposed) {
      throw new Error('Geo data controller has been disposed')
    }
  }

  function refresh(): void {
    state.imagery = imagery.list().map(function copyImagery(item) {
      return { ...item }
    })
    state.resources = browser.list().map(function copyResource(item) {
      return { ...item }
    })
    state.terrain = { ...browser.getTerrain() }
  }

  imagery = createGeoImageryLayerManager(viewer, catalog, {
    onChange: refresh,
  })
  state.terrain = browser.getTerrain()

  async function run<T>(operation: () => Promise<T>): Promise<T | undefined> {
    guard()
    state.busy = true
    state.error = undefined
    try {
      return await operation()
    } catch (error) {
      state.error = error instanceof Error ? error.message : '数据操作失败'
      return undefined
    } finally {
      state.busy = false
      refresh()
    }
  }

  async function addImagery(
    sourceId: GeoImagerySourceId,
    layerOptions: AddImageryLayerOptions = {},
  ): Promise<void> {
    guard()
    state.loadingImagerySource = sourceId
    try {
      await run(async function addLayer() {
        await imagery.add(sourceId, {
          ...options,
          ...layerOptions,
          signal: options.signal,
        })
      })
    } finally {
      state.loadingImagerySource = undefined
      refresh()
    }
  }

  function removeImagery(id: string): void {
    guard()
    imagery.remove(id)
    refresh()
  }

  function setImageryVisible(id: string, show: boolean): void {
    guard()
    imagery.setVisible(id, show)
    refresh()
  }

  function setImageryAlpha(id: string, alpha: number): void {
    guard()
    imagery.setAlpha(id, alpha)
    refresh()
  }

  function raiseImagery(id: string): void {
    guard()
    imagery.raise(id)
    refresh()
  }

  function lowerImagery(id: string): void {
    guard()
    imagery.lower(id)
    refresh()
  }

  function flyToImagery(id: string): void {
    guard()
    imagery.flyTo(id)
  }

  async function loadGeoJson(loadOptions: LoadGeoJsonOptions): Promise<void> {
    await run(async function load() {
      await browser.loadGeoJson(loadOptions)
    })
  }

  async function loadModel(loadOptions: LoadModelOptions): Promise<void> {
    await run(async function load() {
      await browser.loadModel(loadOptions)
    })
  }

  async function loadTileset(loadOptions: LoadTilesetOptions): Promise<void> {
    await run(async function load() {
      await browser.loadTileset(loadOptions)
    })
  }

  function removeResource(id: string): void {
    guard()
    browser.remove(id)
    refresh()
  }

  function setResourceVisible(id: string, show: boolean): void {
    guard()
    browser.setVisible(id, show)
    refresh()
  }

  async function flyToResource(id: string): Promise<void> {
    await run(async function flyTo() {
      await browser.flyTo(id)
    })
  }

  async function setTerrain(id: GeoTerrainResourceId, url?: string): Promise<void> {
    await run(async function set() {
      await browser.setTerrain(id, url)
    })
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    imagery.dispose()
    browser.dispose()
  }

  refresh()
  return {
    state: readonly(state),
    imageryCatalog: imagery.catalog,
    imageryAvailability(sourceId) {
      const source = imagery.catalog.find(function findSource(item) {
        return item.id === sourceId
      })
      if (!source) {
        return { available: false, reason: `Unknown imagery source: ${sourceId}` }
      }
      return source.checkAvailability(options)
    },
    addImagery,
    removeImagery,
    setImageryVisible,
    setImageryAlpha,
    raiseImagery,
    lowerImagery,
    flyToImagery,
    loadGeoJson,
    loadModel,
    loadTileset,
    removeResource,
    setResourceVisible,
    flyToResource,
    setTerrain,
    refresh,
    dispose,
  }
}
