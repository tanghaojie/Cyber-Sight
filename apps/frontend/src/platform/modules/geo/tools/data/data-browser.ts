import {
  Cesium3DTileset,
  CesiumTerrainProvider,
  createWorldTerrainAsync,
  EllipsoidTerrainProvider,
  GeoJsonDataSource,
  Model,
  ShadowMode,
  type Cesium3DTileset as Cesium3DTilesetType,
  type TerrainProvider,
  type Viewer,
} from 'cesium'

export type GeoDataResourceKind = 'geojson' | 'model' | '3d-tiles'
export type GeoTerrainResourceId = 'ellipsoid' | 'cesium-world-terrain' | 'custom'

export interface GeoDataResourceSnapshot {
  readonly id: string
  readonly label: string
  readonly kind: GeoDataResourceKind
  readonly url?: string
  readonly show: boolean
  readonly status: 'ready' | 'loading' | 'failed'
  readonly error?: string
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
}

interface ManagedResource {
  readonly snapshot: {
    id: string
    label: string
    kind: GeoDataResourceKind
    url?: string
  }
  readonly resource: GeoJsonDataSource | Model | Cesium3DTilesetType
  readonly remove: () => boolean
}

export interface GeoDataBrowser {
  list(): readonly GeoDataResourceSnapshot[]
  loadGeoJson(options: LoadGeoJsonOptions): Promise<GeoDataResourceSnapshot>
  loadModel(options: LoadModelOptions): Promise<GeoDataResourceSnapshot>
  loadTileset(options: LoadTilesetOptions): Promise<GeoDataResourceSnapshot>
  remove(id: string): boolean
  clear(): void
  setVisible(id: string, show: boolean): void
  flyTo(id: string, duration?: number): Promise<boolean>
  setTerrain(id: GeoTerrainResourceId, url?: string): Promise<GeoTerrainSnapshot>
  getTerrain(): GeoTerrainSnapshot
  dispose(): void
}

export interface GeoDataBrowserOptions {
  readonly signal?: AbortSignal
  readonly onActiveTilesetChange?: (tileset: Cesium3DTilesetType | undefined) => void
}

function normalizeId(kind: GeoDataResourceKind, requestedId?: string): string {
  return requestedId?.trim() || `${kind}-${Date.now().toString(36)}`
}

function resourceShow(resource: GeoJsonDataSource | Model | Cesium3DTilesetType): boolean {
  return resource.show
}

export function createGeoDataBrowser(
  viewer: Viewer,
  options: GeoDataBrowserOptions = {},
): GeoDataBrowser {
  const resources = new Map<string, ManagedResource>()
  let terrainSnapshot: GeoTerrainSnapshot = {
    id: 'ellipsoid',
    label: '椭球体地形',
    status: 'ready',
  }
  let disposed = false

  function assertActive(): void {
    if (disposed) {
      throw new Error('Geo data browser has been disposed')
    }
    if (options.signal?.aborted) {
      throw new Error('Geo data loading was cancelled')
    }
    if (viewer.isDestroyed()) {
      throw new Error('Geo Viewer has been destroyed')
    }
  }

  function activeTileset(): Cesium3DTilesetType | undefined {
    const managed = [...resources.values()].reverse().find(function findTileset(item) {
      return item.snapshot.kind === '3d-tiles'
    })
    return managed?.resource as Cesium3DTilesetType | undefined
  }

  function notifyActiveTileset(): void {
    options.onActiveTilesetChange?.(activeTileset())
  }

  function cleanupDataSource(resource: GeoJsonDataSource): void {
    if (!viewer.isDestroyed() && viewer.dataSources.contains(resource)) {
      viewer.dataSources.remove(resource, true)
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
      show: resourceShow(managed.resource),
      status: 'ready',
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
        remove: () => viewer.dataSources.remove(resource as GeoJsonDataSource, true),
      }
      viewer.dataSources.add(resource)
      added = true
      resources.set(id, managed)
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
        modelMatrix: options.modelMatrix,
        show: options.show ?? true,
        minimumPixelSize: options.minimumPixelSize,
        shadows: options.shadows,
      })
      assertActive()
      viewer.scene.primitives.add(resource)
      added = true
      const managed: ManagedResource = {
        snapshot: {
          id,
          label: options.label?.trim() || '3D 模型',
          kind: 'model',
          url: options.url,
        },
        resource,
        remove: () => {
          const removed = viewer.isDestroyed()
            ? false
            : viewer.scene.primitives.remove(resource as Model)
          cleanupPrimitive(resource as Model)
          return removed
        },
      }
      resources.set(id, managed)
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
    let added = false
    try {
      resource = await Cesium3DTileset.fromUrl(options.url, {
        show: options.show ?? true,
        maximumScreenSpaceError: options.maximumScreenSpaceError ?? 16,
        shadows: options.shadows,
      })
      assertActive()
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
        remove: () => {
          const removed = viewer.isDestroyed()
            ? false
            : viewer.scene.primitives.remove(resource as Cesium3DTilesetType)
          cleanupPrimitive(resource as Cesium3DTilesetType)
          return removed
        },
      }
      resources.set(id, managed)
      notifyActiveTileset()
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
    managed.resource.show = show
  }

  async function flyTo(id: string, duration = 1.4): Promise<boolean> {
    assertActive()
    const managed = resources.get(id)
    if (!managed || managed.snapshot.kind === 'model') {
      return false
    }
    await viewer.flyTo(managed.resource as GeoJsonDataSource | Cesium3DTilesetType, { duration })
    return true
  }

  async function setTerrain(id: GeoTerrainResourceId, url?: string): Promise<GeoTerrainSnapshot> {
    assertActive()
    terrainSnapshot = {
      id,
      label:
        id === 'ellipsoid'
          ? '椭球体地形'
          : id === 'cesium-world-terrain'
            ? 'Cesium World Terrain'
            : '自定义地形',
      status: 'loading',
    }
    try {
      let provider: TerrainProvider
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
      assertActive()
      viewer.scene.globe.terrainProvider = provider
      terrainSnapshot = { ...terrainSnapshot, status: 'ready' }
    } catch (error) {
      terrainSnapshot = {
        ...terrainSnapshot,
        status: 'failed',
        error: error instanceof Error ? error.message : '地形加载失败',
      }
    }
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
    ;[...resources.keys()].forEach(function disposeResource(id) {
      const managed = resources.get(id)
      resources.delete(id)
      managed?.remove()
    })
    options.onActiveTilesetChange?.(undefined)
  }

  return {
    list,
    loadGeoJson,
    loadModel,
    loadTileset,
    remove,
    clear,
    setVisible,
    flyTo,
    setTerrain,
    getTerrain,
    dispose,
  }
}
