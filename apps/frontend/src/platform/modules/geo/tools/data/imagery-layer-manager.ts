import { ImageryLayer, type Viewer } from 'cesium'
import {
  createGeoImageryCatalog,
  type GeoImagerySourceDefinition,
  type GeoImagerySourceId,
  type GeoImagerySourceOptions,
} from './imagery-sources'

export interface GeoImageryLayerSnapshot {
  readonly id: string
  readonly sourceId: GeoImagerySourceId
  readonly label: string
  readonly role: GeoImagerySourceDefinition['role']
  readonly coordinateSystem: GeoImagerySourceDefinition['coordinateSystem']
  readonly show: boolean
  readonly alpha: number
  readonly index: number
  readonly status: 'ready' | 'loading' | 'failed'
  readonly error?: string
  readonly warning?: string
}

export interface GeoImageryLayerManagerOptions {
  readonly onChange?: () => void
}

export interface AddImageryLayerOptions extends GeoImagerySourceOptions {
  readonly id?: string
  readonly show?: boolean
  readonly alpha?: number
  readonly index?: number
  readonly signal?: AbortSignal
}

interface ManagedImageryLayer {
  readonly snapshotId: string
  readonly definition: GeoImagerySourceDefinition
  readonly layer: ImageryLayer
  readonly removeErrorListener?: () => void
  status: 'ready' | 'failed'
  error?: string
  warning?: string
}

export interface GeoImageryLayerManager {
  readonly catalog: readonly GeoImagerySourceDefinition[]
  list(): readonly GeoImageryLayerSnapshot[]
  add(
    sourceId: GeoImagerySourceId,
    options?: AddImageryLayerOptions,
  ): Promise<GeoImageryLayerSnapshot>
  remove(id: string): boolean
  clear(): void
  setVisible(id: string, show: boolean): void
  setAlpha(id: string, alpha: number): void
  raise(id: string): void
  lower(id: string): void
  raiseToTop(id: string): void
  lowerToBottom(id: string): void
  flyTo(id: string, duration?: number): boolean
  get(id: string): GeoImageryLayerSnapshot | undefined
  dispose(): void
}

function clampAlpha(alpha: number): number {
  return Math.min(1, Math.max(0, alpha))
}

function normalizeId(sourceId: GeoImagerySourceId, requestedId?: string): string {
  const value = requestedId?.trim()
  return value || sourceId
}

export function createGeoImageryLayerManager(
  viewer: Viewer,
  catalog: readonly GeoImagerySourceDefinition[] = createGeoImageryCatalog(),
  managerOptions: GeoImageryLayerManagerOptions = {},
): GeoImageryLayerManager {
  const definitions = new Map(
    catalog.map(function mapDefinition(definition) {
      return [definition.id, definition] as const
    }),
  )
  const layers = new Map<string, ManagedImageryLayer>()
  let disposed = false

  function assertActive(signal?: AbortSignal): void {
    if (disposed) {
      throw new Error('Geo imagery layer manager has been disposed')
    }
    if (signal?.aborted) {
      throw new DOMException('Imagery loading was cancelled', 'AbortError')
    }
    if (viewer.isDestroyed()) {
      throw new Error('Geo Viewer has been destroyed')
    }
  }

  function definitionFor(sourceId: GeoImagerySourceId): GeoImagerySourceDefinition {
    const definition = definitions.get(sourceId)
    if (!definition) {
      throw new Error(`Unknown imagery source: ${sourceId}`)
    }
    return definition
  }

  function toSnapshot(id: string, managed: ManagedImageryLayer): GeoImageryLayerSnapshot {
    return {
      id,
      sourceId: managed.definition.id,
      label: managed.definition.label,
      role: managed.definition.role,
      coordinateSystem: managed.definition.coordinateSystem,
      show: managed.layer.show,
      alpha: managed.layer.alpha,
      index: viewer.imageryLayers.indexOf(managed.layer),
      status: managed.status,
      error: managed.error,
      warning: managed.warning,
    }
  }

  function find(id: string): ManagedImageryLayer {
    const managed = layers.get(id)
    if (!managed) {
      throw new Error(`Imagery layer not found: ${id}`)
    }
    return managed
  }

  function list(): readonly GeoImageryLayerSnapshot[] {
    return [...layers.entries()]
      .map(function mapLayer([id, managed]) {
        return toSnapshot(id, managed)
      })
      .sort(function sortByIndex(a, b) {
        return b.index - a.index
      })
  }

  async function add(
    sourceId: GeoImagerySourceId,
    options: AddImageryLayerOptions = {},
  ): Promise<GeoImageryLayerSnapshot> {
    assertActive(options.signal)
    const definition = definitionFor(sourceId)
    const id = normalizeId(sourceId, options.id)
    if (layers.has(id)) {
      throw new Error(`Imagery layer id already exists: ${id}`)
    }
    const availability = definition.checkAvailability(options)
    if (!availability.available) {
      throw new Error(availability.reason ?? `${definition.label} is not available`)
    }

    const provider = await definition.createProvider(options)
    assertActive(options.signal)
    const layer = viewer.imageryLayers.addImageryProvider(provider, options.index)
    layer.show = options.show ?? true
    layer.alpha = clampAlpha(options.alpha ?? 1)

    let managed: ManagedImageryLayer
    const removeErrorListener = provider.errorEvent.addEventListener(
      function onImageryError(error) {
        const message = error instanceof Error ? error.message : 'Imagery tile request failed'
        managed.error = message
        managed.status = 'failed'
        managerOptions.onChange?.()
      },
    )
    managed = {
      snapshotId: id,
      definition,
      layer,
      removeErrorListener,
      status: 'ready',
      warning: availability.warning,
    }
    layers.set(id, managed)
    return toSnapshot(id, managed)
  }

  function remove(id: string): boolean {
    assertActive()
    const managed = layers.get(id)
    if (!managed) {
      return false
    }
    managed.removeErrorListener?.()
    layers.delete(id)
    return viewer.imageryLayers.remove(managed.layer, true)
  }

  function clear(): void {
    ;[...layers.keys()].forEach(remove)
  }

  function setVisible(id: string, show: boolean): void {
    assertActive()
    find(id).layer.show = show
  }

  function setAlpha(id: string, alpha: number): void {
    assertActive()
    find(id).layer.alpha = clampAlpha(alpha)
  }

  function raise(id: string): void {
    assertActive()
    viewer.imageryLayers.raise(find(id).layer)
  }

  function lower(id: string): void {
    assertActive()
    viewer.imageryLayers.lower(find(id).layer)
  }

  function raiseToTop(id: string): void {
    assertActive()
    viewer.imageryLayers.raiseToTop(find(id).layer)
  }

  function lowerToBottom(id: string): void {
    assertActive()
    viewer.imageryLayers.lowerToBottom(find(id).layer)
  }

  function flyTo(id: string, duration = 1.4): boolean {
    assertActive()
    const managed = find(id)
    const rectangle = managed.layer.imageryProvider.rectangle
    if (!rectangle || rectangle.east <= rectangle.west || rectangle.north <= rectangle.south) {
      return false
    }
    viewer.camera.flyTo({ destination: rectangle, duration })
    return true
  }

  function get(id: string): GeoImageryLayerSnapshot | undefined {
    const managed = layers.get(id)
    return managed ? toSnapshot(id, managed) : undefined
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    ;[...layers.entries()].forEach(function disposeLayer([id, managed]) {
      managed.removeErrorListener?.()
      viewer.imageryLayers.remove(managed.layer, true)
      layers.delete(id)
    })
  }

  return {
    catalog,
    list,
    add,
    remove,
    clear,
    setVisible,
    setAlpha,
    raise,
    lower,
    raiseToTop,
    lowerToBottom,
    flyTo,
    get,
    dispose,
  }
}

export function formatImageryCoverage(layer: GeoImageryLayerSnapshot): string {
  if (layer.status === 'failed') {
    return layer.error ?? '加载失败'
  }
  return `${layer.coordinateSystem} · ${layer.role}`
}
