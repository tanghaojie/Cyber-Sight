import {
  Cartesian2,
  Cartesian3,
  Color,
  CustomDataSource,
  DistanceDisplayCondition,
  LabelStyle,
  NearFarScalar,
  type Viewer,
} from 'cesium'
import type { GeoOpenSkyAircraftState } from '@cyber-ai-forge/api-contract'

const AIRCRAFT_COLOR = Color.fromCssColorString('#49c9ff')
const AIRCRAFT_OUTLINE_COLOR = Color.fromCssColorString('#06111c')
const TRACK_COLOR = Color.fromCssColorString('#4cc9f0').withAlpha(0.58)
const MAX_TRACK_SAMPLES = 12

interface FlightTrackSample {
  sourceTime: number
  position: Cartesian3
}

export interface OpenSkyFlightLayer {
  update(aircraft: readonly GeoOpenSkyAircraftState[], sourceTime: number): number
  clear(): void
  dispose(): void
}

function aircraftPosition(aircraft: GeoOpenSkyAircraftState): Cartesian3 {
  const altitude = aircraft.geometricAltitude ?? aircraft.barometricAltitude ?? 0
  return Cartesian3.fromDegrees(aircraft.longitude, aircraft.latitude, Math.max(0, altitude))
}

function aircraftLabel(aircraft: GeoOpenSkyAircraftState): string {
  return aircraft.callsign ?? aircraft.icao24.toUpperCase()
}

export async function createOpenSkyFlightLayer(viewer: Viewer): Promise<OpenSkyFlightLayer> {
  const dataSource = new CustomDataSource('geo-open-sky-live-flights')
  await viewer.dataSources.add(dataSource)
  const tracks = new Map<string, FlightTrackSample[]>()
  let disposed = false

  function requestRender(): void {
    if (!viewer.isDestroyed()) {
      viewer.scene.requestRender()
    }
  }

  function update(aircraftStates: readonly GeoOpenSkyAircraftState[], sourceTime: number): number {
    if (disposed) {
      return 0
    }

    const activeAircraft = aircraftStates.filter((aircraft) => !aircraft.onGround)
    const activeIds = new Set(activeAircraft.map((aircraft) => aircraft.icao24))
    for (const icao24 of tracks.keys()) {
      if (!activeIds.has(icao24)) {
        tracks.delete(icao24)
      }
    }

    dataSource.entities.removeAll()
    for (const aircraft of activeAircraft) {
      const position = aircraftPosition(aircraft)
      const samples = tracks.get(aircraft.icao24) ?? []
      const lastSample = samples.at(-1)
      if (lastSample?.sourceTime === sourceTime) {
        lastSample.position = position
      } else {
        samples.push({ sourceTime, position })
      }
      if (samples.length > MAX_TRACK_SAMPLES) {
        samples.splice(0, samples.length - MAX_TRACK_SAMPLES)
      }
      tracks.set(aircraft.icao24, samples)

      dataSource.entities.add({
        id: `open-sky:${aircraft.icao24}`,
        name: aircraftLabel(aircraft),
        position,
        point: {
          color: AIRCRAFT_COLOR,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          outlineColor: AIRCRAFT_OUTLINE_COLOR,
          outlineWidth: 2,
          pixelSize: 8,
          scaleByDistance: new NearFarScalar(20_000, 1.2, 3_000_000, 0.62),
        },
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
          text: aircraftLabel(aircraft),
        },
        polyline:
          samples.length > 1
            ? {
                material: TRACK_COLOR,
                positions: samples.map((sample) => sample.position),
                width: 1.5,
              }
            : undefined,
      })
    }
    requestRender()
    return activeAircraft.length
  }

  function clear(): void {
    if (disposed) {
      return
    }
    tracks.clear()
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

  return { update, clear, dispose }
}
