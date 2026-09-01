import {
  Cartesian3,
  Cesium3DTileset,
  CesiumTerrainProvider,
  createWorldTerrainAsync,
  EllipsoidTerrainProvider,
  GeoJsonDataSource,
  HeadingPitchRange,
  HeadingPitchRoll,
  Math as CesiumMath,
  Matrix4,
  Model,
  ShadowMode,
  Transforms,
  type Cesium3DTileset as Cesium3DTilesetType,
  type TerrainProvider,
  type Viewer,
} from 'cesium'
import {
  createCyberCityTilesetVisual,
  type GeoTilesetVisual,
  type GeoTilesetVisualStyle,
} from './tileset-visual-style'

export type { GeoTilesetVisualStyle } from './tileset-visual-style'

export type GeoDataResourceKind = 'geojson' | 'model' | '3d-tiles'
export type GeoTerrainResourceId = 'ellipsoid' | 'cesium-world-terrain' | 'custom'

export interface GeoModelTransform {
  readonly longitude: number
  readonly latitude: number
  readonly height: number
  readonly scale: number
  readonly heading: number
  readonly pitch: number
  readonly roll: number
}

export interface GeoDataResourceSnapshot {
  readonly id: string
  readonly label: string
  readonly kind: GeoDataResourceKind
  readonly url?: string
  readonly show: boolean
  readonly status: 'ready' | 'loading' | 'failed'
  readonly error?: string
  readonly modelTransform?: GeoModelTransform
  readonly visualStyle?: GeoTilesetVisualStyle
  readonly autoHidden?: boolean
  readonly maximumVisibleCameraHeight?: number
}

export interface GeoTerrainSnapshot {
  readonly id: GeoTerrainResourceId
  readonly label: string
  readonly status: 'ready' | 'loading' | 'failed'
  readonly error?: string
}

export interface LoadGeoJsonOptions {
  readonly id?: string
  readonly label?: string
  readonly url?: string
  readonly data?: string | object
  readonly clampToGround?: boolean
  readonly show?: boolean
}

export interface LoadModelOptions {
  readonly id?: string
  readonly label?: string
  readonly url: string
  readonly modelMatrix?: Parameters<typeof Model.fromGltfAsync>[0]['modelMatrix']
  readonly transform?: GeoModelTransform
  readonly show?: boolean
  readonly minimumPixelSize?: number
  readonly shadows?: ShadowMode
}

export interface LoadTilesetOptions {
  readonly id?: string
  readonly label?: string
  readonly url: string
  readonly show?: boolean
  readonly maximumScreenSpaceError?: number
  readonly shadows?: ShadowMode
  readonly visualStyle?: GeoTilesetVisualStyle
  readonly maximumVisibleCameraHeight?: number
}

interface ManagedResource {
  readonly snapshot: {
    id: string
    label: string
    kind: GeoDataResourceKind
    url?: string
    modelTransform?: GeoModelTransform
  }
  readonly resource: GeoJsonDataSource | Model | Cesium3DTilesetType
  readonly remove: () => boolean
  requestedShow: boolean
  autoHidden: boolean
  maximumVisibleCameraHeight?: number
  visualStyle?: GeoTilesetVisualStyle
  tilesetVisual?: GeoTilesetVisual
}

export interface GeoDataBrowser {
  list(): readonly GeoDataResourceSnapshot[]
  loadGeoJson(options: LoadGeoJsonOptions): Promise<GeoDataResourceSnapshot>
  loadModel(options: LoadModelOptions): Promise<GeoDataResourceSnapshot>
  loadTileset(options: LoadTilesetOptions): Promise<GeoDataResourceSnapshot>
  remove(id: string): boolean
  clear(): void
  setVisible(id: string, show: boolean): void
  setTilesetVisualStyle(id: string, style: GeoTilesetVisualStyle): void
  updateModelTransform(id: string, transform: GeoModelTransform): void
  flyTo(id: string, duration?: number): Promise<boolean>
  setTerrain(id: GeoTerrainResourceId, url?: string): Promise<GeoTerrainSnapshot>
  getTerrain(): GeoTerrainSnapshot
  dispose(): void
}

export interface GeoDataBrowserOptions {
  readonly signal?: AbortSignal
  readonly onActiveTilesetChange?: (tileset: Cesium3DTilesetType | undefined) => void
  readonly onResourcesChange?: () => void
  readonly onResourcesError?: (message: string) => void
}

function normalizeId(kind: GeoDataResourceKind, requestedId?: string): string {
  return requestedId?.trim() || `${kind}-${Date.now().toString(36)}`
}

function modelMatrixFromTransform(transform: GeoModelTransform): Matrix4 {
  const values = [
    transform.longitude,
    transform.latitude,
    transform.height,
    transform.scale,
    transform.heading,
    transform.pitch,
    transform.roll,
  ]
  if (values.some((value) => !Number.isFinite(value))) {
    throw new Error('模型位置、缩放和旋转必须是有效数字')
  }
  if (transform.longitude < -180 || transform.longitude > 180) {
    throw new Error('模型经度必须在 -180 到 180 之间')
  }
  if (transform.latitude < -90 || transform.latitude > 90) {
    throw new Error('模型纬度必须在 -90 到 90 之间')
  }
  if (transform.scale <= 0) {
    throw new Error('模型缩放必须大于 0')
  }

  const origin = Cartesian3.fromDegrees(transform.longitude, transform.latitude, transform.height)
  const orientation = new HeadingPitchRoll(
    CesiumMath.toRadians(transform.heading),
    CesiumMath.toRadians(transform.pitch),
    CesiumMath.toRadians(transform.roll),
  )
  const modelMatrix = Transforms.headingPitchRollToFixedFrame(origin, orientation)
  return Matrix4.multiplyByUniformScale(modelMatrix, transform.scale, modelMatrix)
}

export function createGeoDataBrowser(
  viewer: Viewer,
  browserOptions: GeoDataBrowserOptions = {},
): GeoDataBrowser {
  const resources = new Map<string, ManagedResource>()
  let terrainSnapshot: GeoTerrainSnapshot = {
    id: 'ellipsoid',
    label: '椭球体地形',
    status: 'ready',
  }
  let disposed = false
  let terrainRequestVersion = 0
  let scanPhase = 0.34
  let previousTickTime = performance.now()

  function requestRender(): void {
    if (!viewer.isDestroyed()) {
      viewer.scene.requestRender()
    }
  }

  function assertActive(): void {
    if (disposed) {
      throw new Error('Geo data browser has been disposed')
    }
    if (browserOptions.signal?.aborted) {
      throw new Error('Geo data loading was cancelled')
    }
    if (viewer.isDestroyed()) {
      throw new Error('Geo Viewer has been destroyed')
    }
  }

  function syncResourceVisibility(managed: ManagedResource): boolean {
    const previousAutoHidden = managed.autoHidden
    const previousShow = managed.resource.show
    const maximumHeight = managed.maximumVisibleCameraHeight
    managed.autoHidden =
      maximumHeight !== undefined && viewer.camera.positionCartographic.height > maximumHeight
    managed.resource.show = managed.requestedShow && !managed.autoHidden
    return previousAutoHidden !== managed.autoHidden || previousShow !== managed.resource.show
  }

  function syncHeightVisibility(): void {
    if (disposed || viewer.isDestroyed()) {
      return
    }
    let changed = false
    resources.forEach(function syncManagedResource(managed) {
      changed = syncResourceVisibility(managed) || changed
    })
    if (changed) {
      browserOptions.onResourcesChange?.()
    }
  }

  function updateScanPhase(): void {
    const now = performance.now()
    const elapsed = Math.min(Math.max(now - previousTickTime, 0), 250)
    previousTickTime = now
    if (!viewer.clock.shouldAnimate || elapsed === 0) {
      return
    }
    scanPhase = (scanPhase + elapsed / 8_000) % 1
    resources.forEach(function updateVisual(managed) {
      managed.tilesetVisual?.setScanPhase(scanPhase)
    })
  }

  function fallbackTilesetVisuals(): void {
    if (disposed || viewer.isDestroyed()) {
      return
    }
    let changed = false
    resources.forEach(function restoreOriginalMaterial(managed) {
      if (managed.visualStyle !== 'cyber-scan' || managed.snapshot.kind !== '3d-tiles') {
        return
      }
      ;(managed.resource as Cesium3DTilesetType).customShader = undefined
      managed.visualStyle = 'original'
      changed = true
    })
    if (!changed) {
      return
    }
    browserOptions.onResourcesError?.('科技扫描渲染失败，已恢复原始材质')
    browserOptions.onResourcesChange?.()
    requestRender()
  }

  const removePreRenderListener = viewer.scene.preRender.addEventListener(syncHeightVisibility)
  const removeClockTickListener = viewer.clock.onTick.addEventListener(updateScanPhase)
  const removeRenderErrorListener =
    viewer.scene.renderError.addEventListener(fallbackTilesetVisuals)

  function activeTileset(): Cesium3DTilesetType | undefined {
    const managed = [...resources.values()].reverse().find(function findTileset(item) {
      return item.snapshot.kind === '3d-tiles'
    })
    return managed?.resource as Cesium3DTilesetType | undefined
  }

  function notifyActiveTileset(): void {
    browserOptions.onActiveTilesetChange?.(activeTileset())
  }

  function waitForModelReady(model: Model): Promise<void> {
    if (model.ready) {
      return Promise.resolve()
    }
    return new Promise(function wait(resolve, reject) {
      let settled = false

      function cleanup(): void {
        model.readyEvent.removeEventListener(onReady)
        model.errorEvent.removeEventListener(onError)
        browserOptions.signal?.removeEventListener('abort', onAbort)
      }

      function finish(error?: Error): void {
        if (settled) {
          return
        }
        settled = true
        cleanup()
        if (error) {
          reject(error)
          return
        }
        resolve()
      }

      function onReady(): void {
        finish()
      }

      function onError(error: unknown): void {
        if (error instanceof Error) {
          finish(error)
          return
        }
        const message =
          typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : '模型渲染失败'
        finish(new Error(message))
      }

      function onAbort(): void {
        finish(new Error('Geo data loading was cancelled'))
      }

      model.readyEvent.addEventListener(onReady)
      model.errorEvent.addEventListener(onError)
      browserOptions.signal?.addEventListener('abort', onAbort, { once: true })
      if (model.ready) {
        onReady()
        return
      }
      requestRender()
    })
  }

  function cleanupDataSource(resource: GeoJsonDataSource): void {
    if (!viewer.isDestroyed() && viewer.dataSources.contains(resource)) {
      viewer.dataSources.remove(resource, true)
      requestRender()
    }
  }

  function cleanupPrimitive(resource: Model | Cesium3DTilesetType): void {
    if (!resource.isDestroyed()) {
      resource.destroy()
    }
  }

  function snapshotFor(managed: ManagedResource): GeoDataResourceSnapshot {
    return {
      ...managed.snapshot,
      modelTransform: managed.snapshot.modelTransform
        ? { ...managed.snapshot.modelTransform }
        : undefined,
      show: managed.requestedShow,
      status: 'ready',
      visualStyle: managed.visualStyle,
      autoHidden: managed.autoHidden,
      maximumVisibleCameraHeight: managed.maximumVisibleCameraHeight,
    }
  }

  function assertUnique(id: string): void {
    if (resources.has(id)) {
      throw new Error(`Geo data resource id already exists: ${id}`)
    }
  }

  function list(): readonly GeoDataResourceSnapshot[] {
    return [...resources.values()].map(snapshotFor)
  }

  async function loadGeoJson(options: LoadGeoJsonOptions): Promise<GeoDataResourceSnapshot> {
    assertActive()
    if (options.data === undefined && !options.url) {
      throw new Error('GeoJSON loading requires either data or url')
    }
    const id = normalizeId('geojson', options.id)
    assertUnique(id)
    const data = options.data ?? (options.url as string)
    let resource: GeoJsonDataSource | undefined
    let added = false
    try {
      resource = await GeoJsonDataSource.load(data, {
        clampToGround: options.clampToGround ?? true,
      })
      assertActive()
      resource.show = options.show ?? true
      const managed: ManagedResource = {
        snapshot: {
          id,
          label: options.label?.trim() || 'GeoJSON 数据',
          kind: 'geojson',
          url: options.url,
        },
        resource,
        requestedShow: options.show ?? true,
        autoHidden: false,
        remove: () => viewer.dataSources.remove(resource as GeoJsonDataSource, true),
      }
      syncResourceVisibility(managed)
      viewer.dataSources.add(resource)
      added = true
      resources.set(id, managed)
      requestRender()
      return snapshotFor(managed)
    } catch (error) {
      if (resource) {
        if (added) {
          cleanupDataSource(resource)
        }
      }
      throw error
    }
  }

  async function loadModel(options: LoadModelOptions): Promise<GeoDataResourceSnapshot> {
    assertActive()
    const id = normalizeId('model', options.id)
    assertUnique(id)
    let resource: Model | undefined
    let added = false
    try {
      resource = await Model.fromGltfAsync({
        url: options.url,
        modelMatrix: options.transform
          ? modelMatrixFromTransform(options.transform)
          : options.modelMatrix,
        show: options.show ?? true,
        minimumPixelSize: options.minimumPixelSize,
        shadows: options.shadows,
      })
      assertActive()
      viewer.scene.primitives.add(resource)
      added = true
      requestRender()
      await waitForModelReady(resource)
      assertActive()
      const managed: ManagedResource = {
        snapshot: {
          id,
          label: options.label?.trim() || '3D 模型',
          kind: 'model',
          url: options.url,
          modelTransform: options.transform ? { ...options.transform } : undefined,
        },
        resource,
        requestedShow: options.show ?? true,
        autoHidden: false,
        remove: () => {
          const removed = viewer.isDestroyed()
            ? false
            : viewer.scene.primitives.remove(resource as Model)
          cleanupPrimitive(resource as Model)
          return removed
        },
      }
      syncResourceVisibility(managed)
      resources.set(id, managed)
      requestRender()
      return snapshotFor(managed)
    } catch (error) {
      if (resource) {
        if (added && !viewer.isDestroyed()) {
          viewer.scene.primitives.remove(resource)
        }
        cleanupPrimitive(resource)
      }
      throw error
    }
  }

  async function loadTileset(options: LoadTilesetOptions): Promise<GeoDataResourceSnapshot> {
    assertActive()
    const id = normalizeId('3d-tiles', options.id)
    assertUnique(id)
    let resource: Cesium3DTilesetType | undefined
    let visual: GeoTilesetVisual | undefined
    let added = false
    try {
      visual = options.visualStyle ? createCyberCityTilesetVisual() : undefined
      visual?.setScanPhase(scanPhase)
      resource = await Cesium3DTileset.fromUrl(options.url, {
        show: options.show ?? true,
        maximumScreenSpaceError: options.maximumScreenSpaceError ?? 16,
        shadows: options.shadows,
      })
      assertActive()
      resource.customShader = options.visualStyle === 'cyber-scan' ? visual?.shader : undefined
      viewer.scene.primitives.add(resource)
      added = true
      const managed: ManagedResource = {
        snapshot: {
          id,
          label: options.label?.trim() || '3D Tiles',
          kind: '3d-tiles',
          url: options.url,
        },
        resource,
        requestedShow: options.show ?? true,
        autoHidden: false,
        maximumVisibleCameraHeight: options.maximumVisibleCameraHeight,
        visualStyle: options.visualStyle,
        tilesetVisual: visual,
        remove: () => {
          if (resource && resource.customShader === visual?.shader) {
            resource.customShader = undefined
          }
          const removed = viewer.isDestroyed()
            ? false
            : viewer.scene.primitives.remove(resource as Cesium3DTilesetType)
          cleanupPrimitive(resource as Cesium3DTilesetType)
          visual?.dispose()
          return removed
        },
      }
      syncResourceVisibility(managed)
      resources.set(id, managed)
      notifyActiveTileset()
      requestRender()
      return snapshotFor(managed)
    } catch (error) {
      if (resource) {
        if (added && !viewer.isDestroyed()) {
          viewer.scene.primitives.remove(resource)
        }
        cleanupPrimitive(resource)
      }
      visual?.dispose()
      throw error
    }
  }

  function remove(id: string): boolean {
    assertActive()
    const managed = resources.get(id)
    if (!managed) {
      return false
    }
    resources.delete(id)
    const removed = managed.remove()
    if (managed.snapshot.kind === '3d-tiles') {
      notifyActiveTileset()
    }
    requestRender()
    return removed
  }

  function clear(): void {
    ;[...resources.keys()].forEach(remove)
  }

  function setVisible(id: string, show: boolean): void {
    assertActive()
    const managed = resources.get(id)
    if (!managed) {
      throw new Error(`Geo data resource not found: ${id}`)
    }
    managed.requestedShow = show
    syncResourceVisibility(managed)
    requestRender()
  }

  function setTilesetVisualStyle(id: string, style: GeoTilesetVisualStyle): void {
    assertActive()
    const managed = resources.get(id)
    if (!managed || managed.snapshot.kind !== '3d-tiles' || !managed.tilesetVisual) {
      throw new Error(`Geo styled 3D Tiles resource not found: ${id}`)
    }
    const tileset = managed.resource as Cesium3DTilesetType
    managed.visualStyle = style
    tileset.customShader = style === 'cyber-scan' ? managed.tilesetVisual.shader : undefined
    requestRender()
  }

  function updateModelTransform(id: string, transform: GeoModelTransform): void {
    assertActive()
    const managed = resources.get(id)
    if (!managed || managed.snapshot.kind !== 'model') {
      throw new Error(`Geo model resource not found: ${id}`)
    }
    const model = managed.resource as Model
    model.modelMatrix = modelMatrixFromTransform(transform)
    managed.snapshot.modelTransform = { ...transform }
    requestRender()
  }

  async function flyTo(id: string, duration = 1.4): Promise<boolean> {
    assertActive()
    const managed = resources.get(id)
    if (!managed) {
      return false
    }
    if (managed.snapshot.kind === 'model') {
      const model = managed.resource as Model
      await waitForModelReady(model)
      assertActive()
      const range = Math.max(model.boundingSphere.radius * 2.5, 10)
      return new Promise(function flyToModel(resolve) {
        viewer.camera.flyToBoundingSphere(model.boundingSphere, {
          duration,
          offset: new HeadingPitchRange(0, CesiumMath.toRadians(-25), range),
          complete() {
            requestRender()
            resolve(true)
          },
          cancel() {
            resolve(false)
          },
        })
      })
    }
    await viewer.flyTo(managed.resource as GeoJsonDataSource | Cesium3DTilesetType, { duration })
    return true
  }

  async function setTerrain(id: GeoTerrainResourceId, url?: string): Promise<GeoTerrainSnapshot> {
    assertActive()
    const requestVersion = ++terrainRequestVersion
    let provider: TerrainProvider
    try {
      if (id === 'ellipsoid') {
        provider = new EllipsoidTerrainProvider()
      } else if (id === 'cesium-world-terrain') {
        provider = await createWorldTerrainAsync({
          requestVertexNormals: true,
          requestWaterMask: true,
        })
      } else {
        if (!url) {
          throw new Error('自定义地形需要 URL')
        }
        provider = await CesiumTerrainProvider.fromUrl(url)
      }
    } catch (error) {
      if (requestVersion !== terrainRequestVersion) {
        return terrainSnapshot
      }
      throw error
    }

    if (requestVersion !== terrainRequestVersion) {
      return terrainSnapshot
    }
    assertActive()
    viewer.scene.globe.terrainProvider = provider
    terrainSnapshot = {
      id,
      label:
        id === 'ellipsoid'
          ? '椭球体地形'
          : id === 'cesium-world-terrain'
            ? 'Cesium World Terrain'
            : '自定义地形',
      status: 'ready',
    }
    requestRender()
    return terrainSnapshot
  }

  function getTerrain(): GeoTerrainSnapshot {
    return terrainSnapshot
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    terrainRequestVersion += 1
    removePreRenderListener()
    removeClockTickListener()
    removeRenderErrorListener()
    ;[...resources.keys()].forEach(function disposeResource(id) {
      const managed = resources.get(id)
      resources.delete(id)
      managed?.remove()
    })
    browserOptions.onActiveTilesetChange?.(undefined)
    requestRender()
  }

  return {
    list,
    loadGeoJson,
    loadModel,
    loadTileset,
    remove,
    clear,
    setVisible,
    setTilesetVisualStyle,
    updateModelTransform,
    flyTo,
    setTerrain,
    getTerrain,
    dispose,
  }
}
