import { markRaw, reactive, readonly } from 'vue'
import {
  Cartesian3,
  Cartographic,
  Color,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  SceneMode,
  Viewer,
} from 'cesium'
import 'cesium/Build/Cesium/Widgets/widgets.css'
import { createDisposableScope, type DisposableScope } from './disposable'
import { createGeoInteractionManager, type GeoInteractionManager } from './interaction-manager'
import { createGeoViewerAccess, type GeoViewerAccess } from './viewer-access'
import { createGeoPluginRegistry, type GeoPluginRegistry } from './plugin-registry'
import type { GeoPluginDefinition } from './geo-plugin'

export type GeoRuntimeStatus = 'idle' | 'mounting' | 'ready' | 'failed' | 'disposed'
export type GeoSceneMode = '2d' | '3d' | 'columbus'

export interface GeoRuntimeState {
  status: GeoRuntimeStatus
  error?: string
  longitude?: number
  latitude?: number
  cameraHeading?: number
  surfaceHeight?: number
  cameraHeight?: number
  framesPerSecond?: number
  sceneMode: GeoSceneMode
  fullscreen: boolean
}

export interface GeoRuntime {
  readonly viewerAccess: GeoViewerAccess
  readonly interactions: GeoInteractionManager
  readonly plugins: GeoPluginRegistry
  readonly state: Readonly<GeoRuntimeState>
  mount(container: HTMLElement): Promise<void>
  resetCamera(): void
  resetNorth(): void
  locateUser(): Promise<void>
  setSceneMode(mode: GeoSceneMode): void
  toggleFullscreen(target: HTMLElement): Promise<void>
  dispose(): void
}

const SHANGHAI_VIEW = {
  longitude: 121.4737,
  latitude: 31.2304,
  height: 1_150_000,
} as const

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown Geo initialization error'
}

function destroyViewer(viewer: Viewer | undefined): void {
  if (viewer && !viewer.isDestroyed()) {
    viewer.destroy()
  }
}

function configureViewer(viewer: Viewer): void {
  viewer.scene.backgroundColor = Color.fromCssColorString('#07111c')
  viewer.scene.globe.baseColor = Color.fromCssColorString('#10243a')
  viewer.scene.globe.enableLighting = false
  viewer.scene.globe.showGroundAtmosphere = true
  viewer.scene.highDynamicRange = true
  viewer.scene.screenSpaceCameraController.enableCollisionDetection = true
  viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(
    ScreenSpaceEventType.LEFT_DOUBLE_CLICK,
  )
  viewer.camera.setView({
    destination: Cartesian3.fromDegrees(
      SHANGHAI_VIEW.longitude,
      SHANGHAI_VIEW.latitude,
      SHANGHAI_VIEW.height,
    ),
    orientation: {
      heading: 0,
      pitch: CesiumMath.toRadians(-62),
      roll: 0,
    },
  })
}

function registerRuntimeStatus(
  viewer: Viewer,
  state: GeoRuntimeState,
  scope: DisposableScope,
): void {
  function updateCameraHeight(): void {
    state.cameraHeight = viewer.camera.positionCartographic.height
    state.cameraHeading = CesiumMath.toDegrees(viewer.camera.heading)
  }

  updateCameraHeight()
  viewer.camera.percentageChanged = 0.01
  const removeCameraListener = viewer.camera.changed.addEventListener(updateCameraHeight)
  scope.defer(removeCameraListener)

  function updateSceneMode(): void {
    state.sceneMode =
      viewer.scene.mode === SceneMode.SCENE2D
        ? '2d'
        : viewer.scene.mode === SceneMode.COLUMBUS_VIEW
          ? 'columbus'
          : '3d'
  }

  updateSceneMode()
  const removeMorphListener = viewer.scene.morphComplete.addEventListener(updateSceneMode)
  scope.defer(removeMorphListener)

  const pointerHandler = new ScreenSpaceEventHandler(viewer.scene.canvas)
  pointerHandler.setInputAction(function updatePointerPosition(
    movement: ScreenSpaceEventHandler.MotionEvent,
  ) {
    const ray = viewer.camera.getPickRay(movement.endPosition)
    const position = ray ? viewer.scene.globe.pick(ray, viewer.scene) : undefined
    if (!position) {
      return
    }
    const cartographic = Cartographic.fromCartesian(position)
    state.longitude = CesiumMath.toDegrees(cartographic.longitude)
    state.latitude = CesiumMath.toDegrees(cartographic.latitude)
    state.surfaceHeight = cartographic.height
  }, ScreenSpaceEventType.MOUSE_MOVE)
  scope.defer(function destroyPointerHandler() {
    if (!pointerHandler.isDestroyed()) {
      pointerHandler.destroy()
    }
  })

  let frameCount = 0
  let frameWindowStarted = performance.now()
  const removePostRenderListener = viewer.scene.postRender.addEventListener(function trackFrames() {
    frameCount += 1
    const now = performance.now()
    const elapsed = now - frameWindowStarted
    if (elapsed >= 750) {
      state.framesPerSecond = Math.max(0, Math.round((frameCount * 1000) / elapsed))
      frameCount = 0
      frameWindowStarted = now
    }
  })
  scope.defer(removePostRenderListener)
}

export interface GeoRuntimeOptions {
  readonly plugins?: readonly GeoPluginDefinition[]
}

export function createGeoRuntime(options: GeoRuntimeOptions = {}): GeoRuntime {
  const viewerAccessControl = createGeoViewerAccess()
  const interactions = createGeoInteractionManager()
  const plugins = createGeoPluginRegistry({
    definitions: options.plugins ?? [],
    interactions,
  })
  const state = reactive<GeoRuntimeState>({
    status: 'idle',
    sceneMode: '3d',
    fullscreen: false,
  })
  let viewer: Viewer | undefined
  let runtimeScope = createDisposableScope()
  let mountAbortController: AbortController | undefined
  let disposed = false

  function resetCamera(): void {
    const currentViewer = viewerAccessControl.require()
    currentViewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        SHANGHAI_VIEW.longitude,
        SHANGHAI_VIEW.latitude,
        SHANGHAI_VIEW.height,
      ),
      orientation: {
        heading: 0,
        pitch: CesiumMath.toRadians(-62),
        roll: 0,
      },
      duration: 1.2,
    })
  }

  function resetNorth(): void {
    const currentViewer = viewerAccessControl.require()
    currentViewer.camera.flyTo({
      destination: Cartesian3.clone(currentViewer.camera.position),
      orientation: {
        heading: 0,
        pitch: currentViewer.camera.pitch,
        roll: 0,
      },
      duration: 0.6,
    })
  }

  function locateUser(): Promise<void> {
    const currentViewer = viewerAccessControl.require()
    if (!('geolocation' in navigator)) {
      return Promise.reject(new Error('当前浏览器不支持网页定位'))
    }
    return new Promise<void>(function requestUserLocation(resolve, reject) {
      navigator.geolocation.getCurrentPosition(
        function flyToUser(position) {
          if (disposed || currentViewer.isDestroyed()) {
            reject(new Error('Geo 地图已关闭'))
            return
          }
          const height = Math.max(position.coords.accuracy * 8, 5_000)
          currentViewer.camera.flyTo({
            destination: Cartesian3.fromDegrees(
              position.coords.longitude,
              position.coords.latitude,
              height,
            ),
            orientation: {
              heading: 0,
              pitch: CesiumMath.toRadians(-58),
              roll: 0,
            },
            duration: 1.2,
            complete: resolve,
            cancel: resolve,
          })
        },
        function rejectUserLocation(error) {
          const message =
            error.code === GeolocationPositionError.PERMISSION_DENIED
              ? '网页定位权限被拒绝'
              : error.code === GeolocationPositionError.POSITION_UNAVAILABLE
                ? '暂时无法取得当前位置'
                : '网页定位请求超时'
          reject(new Error(message))
        },
        { enableHighAccuracy: true, timeout: 10_000, maximumAge: 30_000 },
      )
    })
  }

  function setSceneMode(mode: GeoSceneMode): void {
    const currentViewer = viewerAccessControl.require()
    state.sceneMode = mode
    if (mode === '2d') {
      currentViewer.scene.morphTo2D(0.8)
      return
    }
    if (mode === 'columbus') {
      currentViewer.scene.morphToColumbusView(0.8)
      return
    }
    currentViewer.scene.morphTo3D(0.8)
  }

  async function toggleFullscreen(target: HTMLElement): Promise<void> {
    if (document.fullscreenElement) {
      await document.exitFullscreen()
      return
    }
    await target.requestFullscreen()
  }

  async function mount(container: HTMLElement): Promise<void> {
    if (disposed) {
      throw new Error('Disposed Geo runtime cannot be mounted')
    }
    if (state.status === 'ready') {
      return
    }

    mountAbortController?.abort()
    mountAbortController = new AbortController()
    const signal = mountAbortController.signal
    runtimeScope = createDisposableScope()
    viewerAccessControl.beginMount()
    state.status = 'mounting'
    state.error = undefined

    try {
      viewer = markRaw(
        new Viewer(container, {
          animation: false,
          baseLayer: false,
          baseLayerPicker: false,
          fullscreenButton: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          navigationHelpButton: false,
          sceneModePicker: false,
          selectionIndicator: false,
          timeline: false,
        }),
      )
      configureViewer(viewer)
      await plugins.install(viewer)
      if (signal.aborted || disposed) {
        destroyViewer(viewer)
        viewer = undefined
        return
      }

      registerRuntimeStatus(viewer, state, runtimeScope)
      function updateFullscreenState(): void {
        state.fullscreen = Boolean(document.fullscreenElement)
      }
      document.addEventListener('fullscreenchange', updateFullscreenState)
      runtimeScope.defer(function removeFullscreenListener() {
        document.removeEventListener('fullscreenchange', updateFullscreenState)
      })

      viewerAccessControl.resolve(viewer)
      state.status = 'ready'
    } catch (error) {
      destroyViewer(viewer)
      viewer = undefined
      if (signal.aborted || disposed) {
        return
      }
      const failure = error instanceof Error ? error : new Error(errorMessage(error))
      viewerAccessControl.fail(failure)
      state.error = failure.message
      state.status = 'failed'
      throw failure
    }
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    mountAbortController?.abort()
    interactions.dispose()
    plugins.dispose()
    try {
      runtimeScope.dispose()
    } catch (error) {
      console.error('Failed to dispose Geo runtime resources', error)
    }
    destroyViewer(viewer)
    viewer = undefined
    viewerAccessControl.dispose()
    state.status = 'disposed'
  }

  return {
    viewerAccess: viewerAccessControl,
    interactions,
    plugins,
    state: readonly(state),
    mount,
    resetCamera,
    resetNorth,
    locateUser,
    setSceneMode,
    toggleFullscreen,
    dispose,
  }
}
