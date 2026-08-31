import { reactive, readonly, type DeepReadonly } from 'vue'
import {
  Cartesian2,
  Cartographic,
  Math as CesiumMath,
  type Cesium3DTileset,
  type Viewer,
} from 'cesium'
import {
  createGeoDataBrowser,
  type GeoDataBrowser,
  type GeoDataBrowserOptions,
  type GeoDataResourceSnapshot,
  type GeoModelTransform,
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
import type { GeoImageryLayerEntry } from './data.capabilities'

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
  suggestModelTransform(): GeoModelTransform
  updateModelTransform(id: string, transform: GeoModelTransform): Promise<void>
  setTerrain(id: GeoTerrainResourceId, url?: string): Promise<void>
  refresh(): void
  dispose(): void
}

export interface GeoDataControllerOptions extends GeoImagerySourceOptions {
  readonly catalog?: ReturnType<typeof createGeoImageryCatalog>
  readonly signal?: AbortSignal
  readonly onActiveTilesetChange?: (tileset: Cesium3DTileset | undefined) => void
  readonly onImageryLayersChange?: (layers: readonly GeoImageryLayerEntry[]) => void
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
  let pendingOperations = 0
  let terrainRequestVersion = 0

  function guard(): void {
    if (disposed) {
      throw new Error('Geo data controller has been disposed')
    }
  }

  function publishImageryLayers(layers: readonly GeoImageryLayerSnapshot[]): void {
    options.onImageryLayersChange?.(
      layers.flatMap(function mapLayer(item): GeoImageryLayerEntry[] {
        const layer = imagery.getLayer(item.id)
        return layer ? [{ id: item.id, label: item.label, index: item.index, layer }] : []
      }),
    )
  }

  function refresh(): void {
    const imageryLayers = imagery.list()
    state.imagery = imageryLayers.map(function copyImagery(item) {
      return { ...item }
    })
    publishImageryLayers(imageryLayers)
    state.resources = browser.list().map(function copyResource(item) {
      return {
        ...item,
        modelTransform: item.modelTransform ? { ...item.modelTransform } : undefined,
      }
    })
    state.terrain = { ...browser.getTerrain() }
  }

  imagery = createGeoImageryLayerManager(viewer, catalog, {
    onChange: refresh,
  })
  state.terrain = browser.getTerrain()

  async function run<T>(operation: () => Promise<T>): Promise<T | undefined> {
    guard()
    pendingOperations += 1
    state.busy = true
    state.error = undefined
    try {
      return await operation()
    } catch (error) {
      state.error = error instanceof Error ? error.message : '数据操作失败'
      return undefined
    } finally {
      pendingOperations -= 1
      state.busy = pendingOperations > 0
      if (!disposed) {
        refresh()
      }
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
        await imagery.add(sourceId, { ...options, ...layerOptions, signal: options.signal })
      })
    } finally {
      state.loadingImagerySource = undefined
      refresh()
    }
  }

  function removeImagery(id: string): void {
    guard()
    if (imagery.get(id)) {
      publishImageryLayers(
        imagery.list().filter(function excludeRemovedLayer(item) {
          return item.id !== id
        }),
      )
    }
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
      const model = await browser.loadModel(loadOptions)
      await browser.flyTo(model.id)
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

  function suggestModelTransform(): GeoModelTransform {
    guard()
    const canvas = viewer.scene.canvas
    const center = new Cartesian2(canvas.clientWidth / 2, canvas.clientHeight / 2)
    const ray = viewer.camera.getPickRay(center)
    const position = ray ? viewer.scene.globe.pick(ray, viewer.scene) : undefined
    const cartographic = position
      ? Cartographic.fromCartesian(position)
      : viewer.camera.positionCartographic
    return {
      longitude: Number(CesiumMath.toDegrees(cartographic.longitude).toFixed(6)),
      latitude: Number(CesiumMath.toDegrees(cartographic.latitude).toFixed(6)),
      height: position ? Number(cartographic.height.toFixed(2)) : 0,
      scale: 1,
      heading: 0,
      pitch: 0,
      roll: 0,
    }
  }

  async function updateModelTransform(id: string, transform: GeoModelTransform): Promise<void> {
    await run(async function update() {
      browser.updateModelTransform(id, transform)
    })
  }

  async function setTerrain(id: GeoTerrainResourceId, url?: string): Promise<void> {
    guard()
    const requestVersion = ++terrainRequestVersion
    const label =
      id === 'ellipsoid'
        ? '椭球体地形'
        : id === 'cesium-world-terrain'
          ? 'Cesium World Terrain'
          : '自定义地形'
    state.terrain = { id, label, status: 'loading' }
    const terrain = await run(async function set() {
      return browser.setTerrain(id, url)
    })
    if (disposed || requestVersion !== terrainRequestVersion) {
      return
    }
    if (terrain) {
      state.terrain = { ...terrain }
      return
    }
    state.terrain = {
      id,
      label,
      status: 'failed',
      error: state.error ?? '地形切换失败',
    }
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    options.onImageryLayersChange?.([])
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
    suggestModelTransform,
    updateModelTransform,
    setTerrain,
    refresh,
    dispose,
  }
}
