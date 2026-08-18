import {
  Cartographic,
  Cartesian3,
  Color,
  createElevationBandMaterial,
  Material,
  CallbackProperty,
  PolygonHierarchy,
  type Entity,
  type Material as CesiumMaterial,
  type TerrainProvider,
  type Viewer,
  sampleTerrainMostDetailed,
} from 'cesium'

export interface TerrainSample {
  readonly requested: Cartographic
  readonly sampled: Cartographic
  readonly height: number
  readonly position: Cartesian3
}

export interface TerrainSampleOptions {
  readonly signal?: AbortSignal
  readonly maxSamples?: number
  readonly onProgress?: (completed: number, total: number) => void
}

export interface FloodOptions {
  readonly signal?: AbortSignal
  readonly waterHeight: number
  readonly durationMs?: number
  readonly color?: Color
  readonly onProgress?: (waterHeight: number) => void
}

export interface TerrainAnalysisSession {
  stop(): void
  dispose(): void
}

export interface ContourOptions {
  readonly signal?: AbortSignal
  readonly minHeight?: number
  readonly maxHeight?: number
  readonly interval?: number
  readonly color?: Color
  readonly maxLines?: number
}

export type TerrainColorMode = 'elevation' | 'contour' | 'slope' | 'aspect'

function throwIfAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw new DOMException('Terrain analysis was cancelled', 'AbortError')
  }
}

function toCartographic(position: Cartesian3): Cartographic {
  return Cartographic.fromCartesian(position)
}

export class TerrainAnalysisTool {
  private readonly entities = new Set<Entity>()
  private readonly originalMaterial: CesiumMaterial | undefined
  private activeSession?: TerrainAnalysisSession
  private disposed = false

  constructor(
    private readonly viewer: Viewer,
    private readonly terrainProvider?: TerrainProvider,
  ) {
    this.originalMaterial = viewer.scene.globe.material
  }

  async sample(
    positions: readonly Cartesian3[],
    options: TerrainSampleOptions = {},
  ): Promise<TerrainSample[]> {
    if (this.disposed) {
      throw new Error('Terrain analysis tool has been disposed')
    }
    const maxSamples = Math.min(Math.max(options.maxSamples ?? 500, 1), 2000)
    const boundedPositions = positions.slice(0, maxSamples)
    if (!boundedPositions.length) {
      return []
    }
    throwIfAborted(options.signal)
    const requested = boundedPositions.map(toCartographic)
    const terrainProvider = this.terrainProvider ?? this.viewer.scene.globe.terrainProvider
    if (!terrainProvider.availability) {
      throw new Error('当前地形不支持高精度采样，请先在数据面板切换到可采样地形')
    }
    const sampled = await sampleTerrainMostDetailed(terrainProvider, requested)
    throwIfAborted(options.signal)
    options.onProgress?.(sampled.length, sampled.length)
    return sampled.map(function makeSample(cartographic, index) {
      const original = requested[index]
      return {
        requested: Cartographic.clone(original, new Cartographic()),
        sampled: Cartographic.clone(cartographic, new Cartographic()),
        height: cartographic.height,
        position: Cartesian3.fromRadians(
          cartographic.longitude,
          cartographic.latitude,
          cartographic.height,
        ),
      }
    })
  }

  startFlood(positions: readonly Cartesian3[], options: FloodOptions): TerrainAnalysisSession {
    if (this.disposed) {
      throw new Error('Terrain analysis tool has been disposed')
    }
    if (positions.length < 3 || !Number.isFinite(options.waterHeight)) {
      throw new Error('Flood analysis needs at least three positions and a finite water height')
    }
    this.stop()
    let currentHeight = 0
    const polygon = this.viewer.entities.add({
      polygon: {
        hierarchy: new PolygonHierarchy(positions.map((position) => Cartesian3.clone(position))),
        height: new CallbackProperty(() => currentHeight, false),
        extrudedHeight: new CallbackProperty(() => currentHeight, false),
        perPositionHeight: false,
        material: (options.color ?? Color.fromCssColorString('#3a9dff')).withAlpha(0.45),
        outline: true,
        outlineColor: options.color ?? Color.fromCssColorString('#3a9dff'),
      },
    })
    this.entities.add(polygon)
    const duration = Math.min(Math.max(options.durationMs ?? 0, 0), 120_000)
    let stopped = false
    let animationFrame: number | undefined
    const startTime = Date.now()
    const update = (): void => {
      if (stopped || options.signal?.aborted) {
        stop()
        return
      }
      const progress = duration === 0 ? 1 : Math.min((Date.now() - startTime) / duration, 1)
      currentHeight = options.waterHeight * progress
      // CallbackProperty reads the current height on every render frame.
      options.onProgress?.(currentHeight)
      if (progress < 1) {
        animationFrame = requestAnimationFrame(update)
      }
    }
    const stop = (): void => {
      if (stopped) {
        return
      }
      stopped = true
      options.signal?.removeEventListener('abort', stop)
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame)
      }
      this.viewer.entities.remove(polygon)
      this.entities.delete(polygon)
      if (this.activeSession === session) {
        this.activeSession = undefined
      }
    }
    const session: TerrainAnalysisSession = { stop, dispose: stop }
    this.activeSession = session
    options.signal?.addEventListener('abort', stop, { once: true })
    update()
    return session
  }

  async createContours(
    positions: readonly Cartesian3[],
    options: ContourOptions = {},
  ): Promise<readonly Entity[]> {
    if (this.disposed) {
      throw new Error('Terrain analysis tool has been disposed')
    }
    const samples = await this.sample(positions, {
      signal: options.signal,
      maxSamples: 200,
    })
    throwIfAborted(options.signal)
    if (!samples.length) {
      return []
    }
    const heights = samples.map((sample) => sample.height)
    const minHeight = options.minHeight ?? Math.min(...heights)
    const maxHeight = options.maxHeight ?? Math.max(...heights)
    const interval = Math.max(options.interval ?? 25, 1)
    const maxLines = Math.min(Math.max(options.maxLines ?? 24, 1), 48)
    const created: Entity[] = []
    try {
      for (
        let height = minHeight;
        height <= maxHeight && created.length < maxLines;
        height += interval
      ) {
        throwIfAborted(options.signal)
        const contourPositions = samples.map(function atHeight(sample) {
          const cartographic = Cartographic.clone(sample.sampled, new Cartographic())
          cartographic.height = height
          return Cartesian3.fromRadians(
            cartographic.longitude,
            cartographic.latitude,
            cartographic.height,
          )
        })
        const entity = this.viewer.entities.add({
          polyline: {
            positions: contourPositions,
            width: 2,
            material: options.color ?? Color.fromCssColorString('#ffc857'),
            clampToGround: false,
          },
        })
        this.entities.add(entity)
        created.push(entity)
      }
    } catch (error) {
      created.forEach((entity) => {
        this.viewer.entities.remove(entity)
        this.entities.delete(entity)
      })
      throw error
    }
    return created
  }

  setTerrainColorMode(mode: TerrainColorMode): void {
    if (this.disposed) {
      throw new Error('Terrain analysis tool has been disposed')
    }
    const globe = this.viewer.scene.globe
    if (mode === 'elevation') {
      globe.material = createElevationBandMaterial({
        scene: this.viewer.scene,
        layers: [
          {
            entries: [
              { height: -500, color: Color.fromCssColorString('#254b8e') },
              { height: 0, color: Color.fromCssColorString('#4ca36b') },
              { height: 1200, color: Color.fromCssColorString('#d8bf71') },
              { height: 3500, color: Color.fromCssColorString('#f4f4f4') },
            ],
            extendDownwards: true,
            extendUpwards: true,
          },
        ],
      })
      return
    }
    if (mode === 'contour') {
      globe.material = Material.fromType(Material.ElevationContourType, {
        color: Color.fromCssColorString('#ffe08a'),
        spacing: 100,
        width: 1.2,
      })
      return
    }
    globe.material = Material.fromType(
      mode === 'slope' ? Material.SlopeRampMaterialType : Material.AspectRampMaterialType,
      {
        image:
          'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAABCAYAAAD0In+KAAAAFElEQVR42mNkYPj/n4GBgYGJAQoAAN0BBy0lVwN3AAAAAElFTkSuQmCC',
      },
    )
  }

  clearTerrainColorMode(): void {
    this.viewer.scene.globe.material = this.originalMaterial
  }

  clear(): void {
    this.stop()
    this.entities.forEach((entity) => this.viewer.entities.remove(entity))
    this.entities.clear()
    this.clearTerrainColorMode()
  }

  removeEntities(entities: readonly Entity[]): void {
    entities.forEach((entity) => {
      this.viewer.entities.remove(entity)
      this.entities.delete(entity)
    })
  }

  stop(): void {
    this.activeSession?.stop()
    this.activeSession = undefined
  }

  dispose(): void {
    if (this.disposed) {
      return
    }
    this.disposed = true
    this.clear()
  }
}
