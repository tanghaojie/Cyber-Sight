import type { GeoModelTransform } from './data-browser'

export const DEFAULT_AI_MODEL_CATALOG_URL = 'https://jt-ai-models.vercel.app/catalog.json'

export interface AiModelCatalogItem {
  readonly id: string
  readonly label: string
  readonly description: string
  readonly thumbnail?: string
  readonly manifest: string
  readonly variants: readonly { readonly id: string; readonly label: string }[]
}

export interface AiModelFile {
  readonly url: string
  readonly bytes: number
  readonly sha256: string
}

export interface AiModelVariant extends AiModelFile {
  readonly id: string
  readonly label: string
}

export interface AiModelManifest {
  readonly id: string
  readonly label: string
  readonly model: AiModelFile
  readonly variants: readonly AiModelVariant[]
  readonly placement: GeoModelTransform & {
    readonly terrain: 'ellipsoid' | 'any'
    readonly notice: string
  }
  readonly resources: readonly {
    readonly id: string
    readonly label: string
    readonly kind: '3d-tiles' | 'geojson'
    readonly url: string
    readonly required: boolean
    readonly dayNight: boolean
  }[]
  readonly attribution: readonly { readonly text: string; readonly url: string }[]
}

function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('AIModels 发布描述必须是有效对象。')
  }
  return value as Record<string, unknown>
}

function text(value: unknown, label: string, max = 2000): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max) {
    throw new Error(`AIModels ${label}无效。`)
  }
  return value
}

function id(value: unknown): string {
  const result = text(value, '标识', 80)
  if (!/^[a-z0-9][a-z0-9-]*$/.test(result)) {
    throw new Error('AIModels 标识格式无效。')
  }
  return result
}

function array(value: unknown, maximum: number): unknown[] {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new Error('AIModels 发布列表无效或过大。')
  }
  return value
}

function unique<T extends { readonly id: string }>(items: T[]): T[] {
  if (new Set(items.map((item) => item.id)).size !== items.length) {
    throw new Error('AIModels 发布列表存在重复标识。')
  }
  return items
}

function number(value: unknown, label: string, min: number, max: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max) {
    throw new Error(`AIModels ${label}超出有效范围。`)
  }
  return value
}

function httpUrl(value: unknown, base: string): URL {
  const url = new URL(text(value, '地址', 4000), base)
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) {
    throw new Error('AIModels 地址必须使用不含登录信息的 HTTP(S)。')
  }
  return url
}

function assetUrl(value: unknown, base: string, origin: string): string {
  const url = httpUrl(value, base)
  if (url.origin !== origin) {
    throw new Error('AIModels 模型和附件必须来自配置的发布站。')
  }
  return url.href
}

async function document(
  url: string,
  signal?: AbortSignal,
): Promise<{ root: Record<string, unknown>; base: string }> {
  const response = await fetch(url, { signal, cache: 'no-cache' })
  if (!response.ok) {
    throw new Error(`AIModels 发布文件读取失败（HTTP ${response.status}）。`)
  }
  const base = response.url || url
  if (new URL(base).origin !== new URL(url).origin) {
    throw new Error('AIModels 发布文件跳转到了其他站点。')
  }
  const body = await response.text()
  if (body.length > 1_000_000) {
    throw new Error('AIModels 发布文件过大。')
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(body)
  } catch {
    throw new Error('AIModels 发布文件不是有效 JSON。')
  }
  const root = object(parsed)
  if (root.version !== 1) {
    throw new Error('暂不支持这个 AIModels 发布版本。')
  }
  return { root, base }
}

export async function loadAiModelCatalog(
  url: string,
  signal?: AbortSignal,
): Promise<readonly AiModelCatalogItem[]> {
  const source = httpUrl(url, window.location.href).href
  const { root, base } = await document(source, signal)
  const origin = new URL(source).origin
  return unique(
    array(root.models, 500).map(function entry(value): AiModelCatalogItem {
      const item = object(value)
      return {
        id: id(item.id),
        label: text(item.label, '名称', 200),
        description: text(item.description, '简介'),
        thumbnail:
          item.thumbnail === undefined ? undefined : assetUrl(item.thumbnail, base, origin),
        manifest: assetUrl(item.manifest, base, origin),
        variants: unique(
          array(item.variants, 8).map(function variant(value) {
            const entry = object(value)
            const key = id(entry.id)
            if (key === 'original') {
              throw new Error('AIModels 质量标识 original 为保留值。')
            }
            return { id: key, label: text(entry.label, '质量名称', 200) }
          }),
        ),
      }
    }),
  )
}

export async function loadAiModelManifest(
  item: AiModelCatalogItem,
  signal?: AbortSignal,
): Promise<AiModelManifest> {
  const { root, base } = await document(item.manifest, signal)
  const origin = new URL(item.manifest).origin
  if (id(root.id) !== item.id) {
    throw new Error('AIModels 目录与模型描述标识不一致。')
  }
  function file(value: unknown): AiModelFile {
    const entry = object(value)
    const sha256 = text(entry.sha256, '文件摘要', 64)
    if (!/^[a-f0-9]{64}$/.test(sha256)) {
      throw new Error('AIModels 文件摘要格式无效。')
    }
    return {
      url: assetUrl(entry.url, base, origin),
      bytes: number(entry.bytes, '文件大小', 1, Number.MAX_SAFE_INTEGER),
      sha256,
    }
  }
  const placement = object(root.placement)
  if (
    placement.crs !== 'EPSG:4326' ||
    placement.coordinateSource !== 'manifest' ||
    !['ellipsoid', 'any'].includes(String(placement.terrain))
  ) {
    throw new Error('AIModels 缺少受支持的定位与地形约定。')
  }
  const variants = unique(
    array(root.variants, 8).map(function variant(value): AiModelVariant {
      const entry = object(value)
      const key = id(entry.id)
      if (key === 'original') {
        throw new Error('AIModels 质量标识 original 为保留值。')
      }
      return { id: key, label: text(entry.label, '质量名称', 200), ...file(value) }
    }),
  )
  const resources = unique(
    array(root.resources, 16).map(function resource(value) {
      const entry = object(value)
      if (
        !['3d-tiles', 'geojson'].includes(String(entry.kind)) ||
        typeof entry.required !== 'boolean' ||
        (entry.dayNight !== undefined && typeof entry.dayNight !== 'boolean')
      ) {
        throw new Error('AIModels 配套资源类型或加载策略无效。')
      }
      return {
        id: id(entry.id),
        label: text(entry.label, '资源名称', 200),
        kind: entry.kind as '3d-tiles' | 'geojson',
        url: assetUrl(entry.url, base, origin),
        required: entry.required,
        dayNight: entry.dayNight === true,
      }
    }),
  )
  return {
    id: item.id,
    label: text(root.label, '名称', 200),
    model: file(root.model),
    variants,
    placement: {
      longitude: number(placement.longitude, '经度', -180, 180),
      latitude: number(placement.latitude, '纬度', -90, 90),
      height: number(placement.height, '椭球高', -10000, 100000),
      scale: number(placement.scale, '缩放', 0.000001, 1000000),
      heading: number(placement.heading, '航向', -360, 360),
      pitch: number(placement.pitch, '俯仰', -360, 360),
      roll: number(placement.roll, '翻滚', -360, 360),
      terrain: placement.terrain as 'ellipsoid' | 'any',
      notice: text(placement.notice, '定位说明'),
    },
    resources,
    attribution: array(root.attribution, 16).map(function credit(value) {
      const entry = object(value)
      return { text: text(entry.text, '署名'), url: httpUrl(entry.url, base).href }
    }),
  }
}
