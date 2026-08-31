import {
  ArcType,
  Cartesian2,
  Cartesian3,
  Cartographic,
  Color,
  CustomDataSource,
  DistanceDisplayCondition,
  EllipsoidGeodesic,
  JulianDate,
  LabelStyle,
  NearFarScalar,
  SampledPositionProperty,
  VelocityOrientationProperty,
  VerticalOrigin,
  type Viewer,
} from 'cesium'

const AIRCRAFT_OUTLINE_COLOR = Color.fromCssColorString('#06111c')
const TRACK_COLOR = Color.fromCssColorString('#4cc9f0').withAlpha(0.58)
const SAMPLE_INTERVAL_SECONDS = 300
const JOURNEYS_PER_DAY = 4

interface GeoCoordinate {
  readonly longitude: number
  readonly latitude: number
}

interface SimulatedFlightDefinition {
  readonly callsign: string
  readonly destination: GeoCoordinate
  readonly id: string
  readonly origin: GeoCoordinate
  readonly phase: number
}

const SIMULATED_FLIGHTS: readonly SimulatedFlightDefinition[] = [
  {
    id: 'sim-101',
    callsign: 'SIM 101',
    origin: { longitude: 116.4074, latitude: 39.9042 },
    destination: { longitude: 121.4737, latitude: 31.2304 },
    phase: 0.03,
  },
  {
    id: 'sim-202',
    callsign: 'SIM 202',
    origin: { longitude: 113.2644, latitude: 23.1291 },
    destination: { longitude: 104.0665, latitude: 30.5728 },
    phase: 0.16,
  },
  {
    id: 'sim-303',
    callsign: 'SIM 303',
    origin: { longitude: 108.9398, latitude: 34.3416 },
    destination: { longitude: 114.0579, latitude: 22.5431 },
    phase: 0.29,
  },
  {
    id: 'sim-404',
    callsign: 'SIM 404',
    origin: { longitude: 87.6168, latitude: 43.8256 },
    destination: { longitude: 120.1551, latitude: 30.2741 },
    phase: 0.42,
  },
  {
    id: 'sim-505',
    callsign: 'SIM 505',
    origin: { longitude: 102.8329, latitude: 24.8801 },
    destination: { longitude: 118.7969, latitude: 32.0603 },
    phase: 0.55,
  },
  {
    id: 'sim-606',
    callsign: 'SIM 606',
    origin: { longitude: 126.5349, latitude: 45.8038 },
    destination: { longitude: 123.4315, latitude: 41.8057 },
    phase: 0.68,
  },
  {
    id: 'sim-707',
    callsign: 'SIM 707',
    origin: { longitude: 91.1322, latitude: 29.6604 },
    destination: { longitude: 106.5516, latitude: 29.563 },
    phase: 0.81,
  },
  {
    id: 'sim-808',
    callsign: 'SIM 808',
    origin: { longitude: 120.3826, latitude: 36.0671 },
    destination: { longitude: 118.0894, latitude: 24.4798 },
    phase: 0.94,
  },
]

export interface SimulatedFlightLayer {
  show(): number
  clear(): void
  dispose(): void
}

function routeProgress(progress: number, phase: number): number {
  const cycleProgress = (progress * JOURNEYS_PER_DAY + phase) % 1
  return cycleProgress <= 0.5 ? cycleProgress * 2 : (1 - cycleProgress) * 2
}

function createAircraftIcon(): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.height = 64
  canvas.width = 64
  const context = canvas.getContext('2d')
  if (!context) {
    throw new Error('无法创建模拟飞机图标画布')
  }

  context.fillStyle = '#49c9ff'
  context.lineJoin = 'round'
  context.lineWidth = 3
  context.strokeStyle = '#06111c'
  context.beginPath()
  context.moveTo(32, 4)
  context.lineTo(39, 25)
  context.lineTo(57, 33)
  context.lineTo(57, 38)
  context.lineTo(39, 36)
  context.lineTo(39, 52)
  context.lineTo(46, 59)
  context.lineTo(42, 61)
  context.lineTo(32, 56)
  context.lineTo(22, 61)
  context.lineTo(18, 59)
  context.lineTo(25, 52)
  context.lineTo(25, 36)
  context.lineTo(7, 38)
  context.lineTo(7, 33)
  context.lineTo(25, 25)
  context.closePath()
  context.fill()
  context.stroke()
  return canvas
}

function positionFor(
  geodesic: EllipsoidGeodesic,
  progress: number,
  result: Cartesian3,
): Cartesian3 {
  const coordinate = geodesic.interpolateUsingFraction(progress)
  const cruiseHeight = 8_500 + 2_500 * Math.sin(progress * Math.PI)
  return Cartesian3.fromRadians(
    coordinate.longitude,
    coordinate.latitude,
    cruiseHeight,
    undefined,
    result,
  )
}

function createPositionProperty(
  definition: SimulatedFlightDefinition,
  start: JulianDate,
  stop: JulianDate,
): SampledPositionProperty {
  const property = new SampledPositionProperty()
  const origin = Cartographic.fromDegrees(definition.origin.longitude, definition.origin.latitude)
  const destination = Cartographic.fromDegrees(
    definition.destination.longitude,
    definition.destination.latitude,
  )
  const geodesic = new EllipsoidGeodesic(origin, destination)
  const duration = JulianDate.secondsDifference(stop, start)
  const samplePosition = new Cartesian3()

  for (let seconds = 0; seconds <= duration; seconds += SAMPLE_INTERVAL_SECONDS) {
    const time = JulianDate.addSeconds(start, Math.min(seconds, duration), new JulianDate())
    const progress = routeProgress(seconds / duration, definition.phase)
    property.addSample(time, positionFor(geodesic, progress, samplePosition))
  }
  return property
}

export async function createSimulatedFlightLayer(viewer: Viewer): Promise<SimulatedFlightLayer> {
  const dataSource = new CustomDataSource('geo-simulated-flights')
  const aircraftIcon = createAircraftIcon()
  await viewer.dataSources.add(dataSource)
  let disposed = false

  function requestRender(): void {
    if (!viewer.isDestroyed()) {
      viewer.scene.requestRender()
    }
  }

  function show(): number {
    if (disposed) {
      return 0
    }

    dataSource.entities.removeAll()
    const start = JulianDate.clone(viewer.clock.startTime)
    const stop = JulianDate.clone(viewer.clock.stopTime)
    for (const definition of SIMULATED_FLIGHTS) {
      const position = createPositionProperty(definition, start, stop)
      dataSource.entities.add({
        id: `simulated-flight-route:${definition.id}`,
        name: `模拟航线 ${definition.callsign}`,
        polyline: {
          arcType: ArcType.GEODESIC,
          material: TRACK_COLOR.withAlpha(0.8),
          positions: Cartesian3.fromDegreesArray([
            definition.origin.longitude,
            definition.origin.latitude,
            definition.destination.longitude,
            definition.destination.latitude,
          ]),
          width: 1.5,
        },
      })
      dataSource.entities.add({
        id: `simulated-flight:${definition.id}`,
        name: `模拟航班 ${definition.callsign}`,
        orientation: new VelocityOrientationProperty(position),
        path: {
          leadTime: 1_200,
          material: TRACK_COLOR,
          resolution: SAMPLE_INTERVAL_SECONDS,
          trailTime: 7_200,
          width: 1.5,
        },
        billboard: {
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          image: aircraftIcon,
          scale: 0.48,
          scaleByDistance: new NearFarScalar(20_000, 0.62, 3_000_000, 0.3),
          verticalOrigin: VerticalOrigin.CENTER,
        },
        position,
        label: {
          backgroundColor: Color.fromCssColorString('#07111c').withAlpha(0.78),
          distanceDisplayCondition: new DistanceDisplayCondition(0, 2_500_000),
          fillColor: Color.WHITE,
          font: '600 12px "IBM Plex Mono", "Cascadia Code", monospace',
          outlineColor: AIRCRAFT_OUTLINE_COLOR,
          outlineWidth: 3,
          pixelOffset: new Cartesian2(12, -12),
          scaleByDistance: new NearFarScalar(20_000, 1, 2_500_000, 0.7),
          showBackground: true,
          style: LabelStyle.FILL_AND_OUTLINE,
          text: `SIM · ${definition.callsign}`,
        },
      })
    }
    requestRender()
    return SIMULATED_FLIGHTS.length
  }

  function clear(): void {
    if (disposed) {
      return
    }
    dataSource.entities.removeAll()
    requestRender()
  }

  function dispose(): void {
    if (disposed) {
      return
    }
    clear()
    disposed = true
    if (!viewer.isDestroyed() && viewer.dataSources.contains(dataSource)) {
      viewer.dataSources.remove(dataSource, true)
    }
  }

  return { show, clear, dispose }
}
