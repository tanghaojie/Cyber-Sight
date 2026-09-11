import { createGeoCapabilityToken } from '../../core/capability-registry'
import type { GeoModelRenderingManager } from '../../tools/scene/model-rendering'

export interface GeoSolarLightingState {
  readonly lighting: boolean
  readonly shadows: boolean
}

export interface GeoSolarLightingCapability {
  readonly state: GeoSolarLightingState
  setLighting(enabled: boolean): void
  setShadows(enabled: boolean): void
}

export const geoSolarLightingCapability =
  createGeoCapabilityToken<GeoSolarLightingCapability>('scene.solarLighting')

export const geoModelRenderingCapability =
  createGeoCapabilityToken<GeoModelRenderingManager>('scene.modelRendering')
