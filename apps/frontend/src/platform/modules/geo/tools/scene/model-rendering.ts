import {
  Cartesian2,
  Cartesian3,
  Cartographic,
  CustomShader,
  Ellipsoid,
  JulianDate,
  Math as CesiumMath,
  Matrix3,
  Matrix4,
  Model,
  Simon1994PlanetaryPositions,
  Transforms,
  UniformType,
  type Viewer,
} from 'cesium'

export interface GeoModelRenderingRegistration {
  update(): void
  dispose(): void
}

export interface GeoModelRenderingManager {
  register(model: Model): GeoModelRenderingRegistration
  dispose(): void
}

interface ManagedModel {
  readonly model: Model
  readonly shader: ReturnType<typeof createModelShader>
  readonly originalShader: Model['customShader']
  readonly originalLightColor: Cartesian3 | undefined
  baseLightColor: Cartesian3
  readonly usesSceneLight: boolean
  readonly originalIblFactor: Cartesian2
  dirty: boolean
  disposed: boolean
  lastNightFactor: number | undefined
  lastDirectFactor: number | undefined
  lastSceneLight: SceneLightSnapshot | undefined
}

interface SceneLightSnapshot {
  readonly red: number
  readonly green: number
  readonly blue: number
  readonly intensity: number
}

const DAYLIGHT_HEIGHT_DEGREES = 2
const NIGHT_HEIGHT_DEGREES = -6
const NIGHT_IBL_FACTOR = 0.2
const solarPositionScratch = new Cartesian3()
const sunFixedScratch = new Cartesian3()
const fixedTransformScratch = new Matrix3()
const surfaceNormalScratch = new Cartesian3()
const modelCartographicScratch = new Cartographic()

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(Math.max((value - edge0) / (edge1 - edge0), 0), 1)
  return t * t * (3 - 2 * t)
}

function createModelShader() {
  return new CustomShader({
    fragmentShaderText: `
      void fragmentMain(FragmentInput fsInput, inout czm_modelMaterial material) {
        #ifdef LIGHTING_PBR
          material.emissive *= u_nightFactor;
        #endif
      }
    `,
    uniforms: {
      u_nightFactor: {
        type: UniformType.FLOAT,
        value: 0.0,
      },
    },
  })
}

function solarHeightDegrees(origin: Cartesian3, sunFixed: Cartesian3): number {
  const topocentricSun = Cartesian3.subtract(sunFixed, origin, solarPositionScratch)
  Cartesian3.normalize(topocentricSun, topocentricSun)
  const surfaceNormal = Ellipsoid.WGS84.geodeticSurfaceNormal(origin, surfaceNormalScratch)
  const cosine = Math.min(Math.max(Cartesian3.dot(surfaceNormal, topocentricSun), -1), 1)
  return CesiumMath.toDegrees(Math.asin(cosine))
}

function sunPositionFixed(time: JulianDate): Cartesian3 | undefined {
  const transform = Transforms.computeIcrfToCentralBodyFixedMatrix(time, fixedTransformScratch)
  if (!transform) {
    return undefined
  }
  const sunInertial = Simon1994PlanetaryPositions.computeSunPositionInEarthInertialFrame(
    time,
    solarPositionScratch,
  )
  return Matrix3.multiplyByVector(transform, sunInertial, sunFixedScratch)
}

function resolveOrigin(model: Model): Cartesian3 {
  const origin = Matrix4.getTranslation(model.modelMatrix, new Cartesian3())
  if (!Cartesian3.equalsEpsilon(origin, Cartesian3.ZERO, 1e-6, 1e-6)) {
    const cartographic = Cartographic.fromCartesian(
      origin,
      Ellipsoid.WGS84,
      modelCartographicScratch,
    )
    if (
      cartographic &&
      Number.isFinite(cartographic.longitude) &&
      Number.isFinite(cartographic.latitude) &&
      Number.isFinite(cartographic.height)
    ) {
      return origin
    }
  }
  throw new Error('外部模型的 WGS84 定位无效，无法启用昼夜渲染')
}

function sceneLightSnapshot(viewer: Viewer): SceneLightSnapshot {
  const sceneLight = viewer.scene.light
  return {
    red: sceneLight.color.red,
    green: sceneLight.color.green,
    blue: sceneLight.color.blue,
    intensity: sceneLight.intensity,
  }
}

function sceneBaseLightColor(viewer: Viewer): Cartesian3 {
  const sceneLight = sceneLightSnapshot(viewer)
  return Cartesian3.fromElements(
    sceneLight.red * sceneLight.intensity,
    sceneLight.green * sceneLight.intensity,
    sceneLight.blue * sceneLight.intensity,
    new Cartesian3(),
  )
}

function sceneLightChanged(item: ManagedModel, viewer: Viewer): boolean {
  if (!item.usesSceneLight || !item.lastSceneLight) {
    return item.usesSceneLight
  }
  const current = sceneLightSnapshot(viewer)
  return (
    current.red !== item.lastSceneLight.red ||
    current.green !== item.lastSceneLight.green ||
    current.blue !== item.lastSceneLight.blue ||
    current.intensity !== item.lastSceneLight.intensity
  )
}

export function createGeoModelRenderingManager(viewer: Viewer): GeoModelRenderingManager {
  const registrations = new Set<ManagedModel>()
  let disposed = false
  let lastTime: JulianDate | undefined

  function applyModel(item: ManagedModel, sunFixed: Cartesian3): boolean {
    if (item.disposed || item.model.isDestroyed()) {
      return false
    }
    const origin = resolveOrigin(item.model)
    const altitude = solarHeightDegrees(origin, sunFixed)
    const nightFactor = 1 - smoothstep(NIGHT_HEIGHT_DEGREES, DAYLIGHT_HEIGHT_DEGREES, altitude)
    const directFactor = smoothstep(0, DAYLIGHT_HEIGHT_DEGREES, altitude)
    if (item.usesSceneLight) {
      item.baseLightColor = sceneBaseLightColor(viewer)
      item.lastSceneLight = sceneLightSnapshot(viewer)
    }
    const iblFactor = 1 - (1 - NIGHT_IBL_FACTOR) * nightFactor
    const nextIbl = Cartesian2.fromElements(
      item.originalIblFactor.x * iblFactor,
      item.originalIblFactor.y * iblFactor,
    )
    const currentIbl = item.model.imageBasedLighting.imageBasedLightingFactor
    const nextLight = Cartesian3.multiplyByScalar(
      item.baseLightColor,
      directFactor,
      new Cartesian3(),
    )
    const currentLight = (item.model as Model & { lightColor?: Cartesian3 }).lightColor
    const changed =
      item.lastNightFactor !== nightFactor ||
      item.lastDirectFactor !== directFactor ||
      !Cartesian2.equalsEpsilon(currentIbl, nextIbl, 1e-7, 1e-7) ||
      !currentLight ||
      !Cartesian3.equalsEpsilon(currentLight, nextLight, 1e-7, 1e-7)
    item.shader.setUniform('u_nightFactor', nightFactor)
    item.model.imageBasedLighting.imageBasedLightingFactor = nextIbl
    ;(item.model as Model & { lightColor?: Cartesian3 }).lightColor = nextLight
    item.dirty = false
    item.lastNightFactor = nightFactor
    item.lastDirectFactor = directFactor
    return changed
  }

  function updateModels(time: JulianDate): void {
    if (disposed || registrations.size === 0) {
      return
    }
    const timeChanged = !lastTime || !JulianDate.equals(lastTime, time)
    const sceneLightChangedNow = [...registrations].some((item) => sceneLightChanged(item, viewer))
    if (!timeChanged && !sceneLightChangedNow && ![...registrations].some((item) => item.dirty)) {
      return
    }
    let sunFixed: Cartesian3 | undefined
    try {
      sunFixed = sunPositionFixed(time)
    } catch {
      return
    }
    if (!sunFixed) {
      return
    }
    lastTime = JulianDate.clone(time, lastTime)
    registrations.forEach(function updateModel(item) {
      if (item.disposed || (!timeChanged && !item.dirty && !sceneLightChanged(item, viewer))) {
        return
      }
      try {
        const changed = applyModel(item, sunFixed)
        if (changed) {
          viewer.scene.requestRender()
        }
      } catch {
        // A preUpdate listener must not stop Cesium's frame. Direct registration
        // updates still throw so the Data integration can report the failure.
        item.dirty = false
      }
    })
  }

  const removePreUpdateListener = viewer.scene.preUpdate.addEventListener(function onPreUpdate() {
    updateModels(viewer.clock.currentTime)
  })

  function register(model: Model): GeoModelRenderingRegistration {
    if (disposed) {
      throw new Error('Geo model rendering manager has been disposed')
    }
    if (model.isDestroyed()) {
      throw new Error('无法为已销毁的模型启用昼夜渲染')
    }
    if ([...registrations].some((item) => item.model === model && !item.disposed)) {
      throw new Error('模型已经注册统一昼夜渲染')
    }
    resolveOrigin(model)
    const currentTime = viewer.clock.currentTime
    const sunFixed = sunPositionFixed(currentTime)
    if (!sunFixed) {
      throw new Error('无法根据当前仿真时间计算太阳位置')
    }
    const shader = createModelShader()
    const configuredLightColor = (model as Model & { lightColor?: Cartesian3 }).lightColor
    const managed: ManagedModel = {
      model,
      shader,
      originalShader: model.customShader,
      originalLightColor: configuredLightColor
        ? Cartesian3.clone(configuredLightColor, new Cartesian3())
        : undefined,
      baseLightColor: configuredLightColor
        ? Cartesian3.clone(configuredLightColor, new Cartesian3())
        : sceneBaseLightColor(viewer),
      usesSceneLight: !configuredLightColor,
      originalIblFactor: Cartesian2.clone(model.imageBasedLighting.imageBasedLightingFactor),
      dirty: true,
      disposed: false,
      lastNightFactor: undefined,
      lastDirectFactor: undefined,
      lastSceneLight: undefined,
    }
    try {
      model.customShader = shader
      registrations.add(managed)
      const changed = applyModel(managed, sunFixed)
      if (changed) {
        viewer.scene.requestRender()
      }
      return {
        update() {
          if (!managed.disposed) {
            managed.dirty = true
            const sunFixed = sunPositionFixed(viewer.clock.currentTime)
            if (!sunFixed) {
              throw new Error('无法根据当前仿真时间计算太阳位置')
            }
            if (applyModel(managed, sunFixed)) {
              viewer.scene.requestRender()
            }
          }
        },
        dispose() {
          if (managed.disposed) {
            return
          }
          managed.disposed = true
          registrations.delete(managed)
          try {
            if (!model.isDestroyed()) {
              model.customShader = managed.originalShader
              model.imageBasedLighting.imageBasedLightingFactor = managed.originalIblFactor
              ;(model as unknown as { lightColor: Cartesian3 | undefined }).lightColor =
                managed.originalLightColor
            }
          } finally {
            shader.destroy()
          }
        },
      }
    } catch (error) {
      registrations.delete(managed)
      try {
        if (!model.isDestroyed()) {
          model.customShader = managed.originalShader
          model.imageBasedLighting.imageBasedLightingFactor = managed.originalIblFactor
          ;(model as unknown as { lightColor: Cartesian3 | undefined }).lightColor =
            managed.originalLightColor
        }
      } finally {
        shader.destroy()
      }
      throw error
    }
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    disposed = true
    removePreUpdateListener()
    registrations.forEach(function disposeModel(item) {
      item.disposed = true
      try {
        if (!item.model.isDestroyed()) {
          item.model.customShader = item.originalShader
          item.model.imageBasedLighting.imageBasedLightingFactor = item.originalIblFactor
          ;(item.model as unknown as { lightColor: Cartesian3 | undefined }).lightColor =
            item.originalLightColor
        }
      } catch {
        // Continue restoring and destroying the remaining model registrations.
      } finally {
        try {
          item.shader.destroy()
        } catch {
          // Continue cleaning up the remaining registrations.
        }
      }
    })
    registrations.clear()
  }

  return { register, dispose }
}
