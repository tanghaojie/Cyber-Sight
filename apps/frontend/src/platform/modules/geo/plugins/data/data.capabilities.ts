import type { Cesium3DTileset } from 'cesium'
import type { Disposable, DisposableScope } from '../../core/disposable'
import { createGeoCapabilityToken } from '../../core/capability-registry'

export interface ActiveTilesetCapability {
  readonly current: Cesium3DTileset | undefined
  getCurrent(): Cesium3DTileset | undefined
  subscribe(
    listener: (tileset: Cesium3DTileset | undefined) => void,
    scope?: DisposableScope,
  ): Disposable
}

export interface ActiveTilesetCapabilityPublisher extends ActiveTilesetCapability {
  setCurrent(tileset: Cesium3DTileset | undefined): void
}

export const activeTilesetCapability =
  createGeoCapabilityToken<ActiveTilesetCapability>('data.activeTileset')

export function createActiveTilesetCapability(): ActiveTilesetCapabilityPublisher {
  let current: Cesium3DTileset | undefined
  const listeners = new Set<(tileset: Cesium3DTileset | undefined) => void>()

  function subscribe(
    listener: (tileset: Cesium3DTileset | undefined) => void,
    scope?: DisposableScope,
  ): Disposable {
    listeners.add(listener)
    const registration: Disposable = {
      dispose() {
        listeners.delete(listener)
      },
    }
    scope?.use(registration)
    listener(current)
    return registration
  }

  function setCurrent(tileset: Cesium3DTileset | undefined): void {
    if (current === tileset) {
      return
    }
    current = tileset
    listeners.forEach(function notify(listener) {
      listener(current)
    })
  }

  return {
    get current() {
      return current
    },
    getCurrent() {
      return current
    },
    subscribe,
    setCurrent,
  }
}
