import { reactive, readonly, type DeepReadonly } from 'vue'
import type { Viewer } from 'cesium'
import {
  getGeoSceneSettings,
  setGeoSceneSettings,
  type GeoSceneSettings,
  type GeoSceneSettingsPatch,
} from '../../tools/scene/scene-settings'

export interface GeoSceneController {
  readonly state: DeepReadonly<GeoSceneSettings>
  set(patch: GeoSceneSettingsPatch): void
  toggle(key: keyof GeoSceneSettings): void
  refresh(): void
  dispose(): void
}

export function createGeoSceneController(viewer: Viewer): GeoSceneController {
  const state = reactive<GeoSceneSettings>(getGeoSceneSettings(viewer))
  let disposed = false

  function guard(): void {
    if (disposed) {
      throw new Error('Geo scene controller has been disposed')
    }
  }

  function update(patch: GeoSceneSettingsPatch): void {
    guard()
    Object.assign(state, setGeoSceneSettings(viewer, patch))
  }

  function set(patch: GeoSceneSettingsPatch): void {
    update(patch)
  }

  function toggle(key: keyof GeoSceneSettings): void {
    if (typeof state[key] !== 'boolean') {
      return
    }
    update({ [key]: !state[key] })
  }

  function refresh(): void {
    guard()
    Object.assign(state, getGeoSceneSettings(viewer))
  }

  function dispose(): void {
    disposed = true
  }

  return { state: readonly(state), set, toggle, refresh, dispose }
}
