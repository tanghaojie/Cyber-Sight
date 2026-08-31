import { Injectable } from '@nestjs/common'
import { z } from 'zod'
import {
  GeoOpenSkyAircraftStateSchema,
  GeoOpenSkyStatesDataSchema,
  type GeoOpenSkyAircraftState,
  type GeoOpenSkyStatesData,
  type GeoOpenSkyStatesQuery,
} from '@cyber-ai-forge/api-contract'

const OPEN_SKY_STATES_URL = 'https://opensky-network.org/api/states/all'
const OPEN_SKY_TIMEOUT_MS = 10_000

const OpenSkyPayloadSchema = z.object({
  time: z.number().int().min(0),
  states: z.array(z.array(z.unknown())).nullable(),
})

export class GeoOpenSkyRequestError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'GeoOpenSkyRequestError'
  }
}

function finiteNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function integer(value: unknown): number | null {
  const number = finiteNumber(value)
  return number !== null && Number.isInteger(number) ? number : null
}

function normalizeCallsign(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null
  }
  return value.trim() || null
}

function normalizeAircraft(
  row: unknown[],
  sourceTime: number,
): GeoOpenSkyAircraftState | undefined {
  const longitude = finiteNumber(row[5])
  const latitude = finiteNumber(row[6])
  const lastContact = integer(row[4])
  if (longitude === null || latitude === null || lastContact === null) {
    return undefined
  }

  const candidate = GeoOpenSkyAircraftStateSchema.safeParse({
    icao24: typeof row[0] === 'string' ? row[0].toLowerCase() : '',
    callsign: normalizeCallsign(row[1]),
    originCountry: typeof row[2] === 'string' && row[2].trim() ? row[2].trim() : 'Unknown',
    timePosition: integer(row[3]),
    lastContact,
    longitude,
    latitude,
    barometricAltitude: finiteNumber(row[7]),
    geometricAltitude: finiteNumber(row[13]),
    onGround: row[8] === true,
    velocity: finiteNumber(row[9]),
    trueTrack: finiteNumber(row[10]),
    verticalRate: finiteNumber(row[11]),
    category: integer(row[17]),
  })

  if (!candidate.success || sourceTime - candidate.data.lastContact > 300) {
    return undefined
  }
  return candidate.data
}

function parseRateLimitRemaining(response: Response): number | null {
  const raw = response.headers.get('x-rate-limit-remaining')
  if (!raw) {
    return null
  }
  const value = Number(raw)
  return Number.isInteger(value) && value >= 0 ? value : null
}

@Injectable()
export class GeoService {
  getOpenSkyStates(query: GeoOpenSkyStatesQuery): Promise<GeoOpenSkyStatesData> {
    return requestOpenSkyStates(query)
  }
}

export async function requestOpenSkyStates(
  query: GeoOpenSkyStatesQuery,
  request: typeof fetch = fetch,
): Promise<GeoOpenSkyStatesData> {
  const url = new URL(OPEN_SKY_STATES_URL)
  Object.entries(query).forEach(function addQuery([key, value]) {
    url.searchParams.set(key, String(value))
  })

  const abortController = new AbortController()
  const timeout = setTimeout(function abortTimedOutRequest() {
    abortController.abort()
  }, OPEN_SKY_TIMEOUT_MS)

  try {
    const response = await request(url, {
      headers: { accept: 'application/json' },
      signal: abortController.signal,
    })
    if (!response.ok) {
      throw new GeoOpenSkyRequestError(`OpenSky returned HTTP ${response.status}`)
    }

    const payload = OpenSkyPayloadSchema.safeParse(await response.json())
    if (!payload.success) {
      throw new GeoOpenSkyRequestError('OpenSky returned an invalid response')
    }

    const aircraft = (payload.data.states ?? []).flatMap(function normalizeState(row) {
      const state = normalizeAircraft(row, payload.data.time)
      return state ? [state] : []
    })

    return GeoOpenSkyStatesDataSchema.parse({
      sourceTime: payload.data.time,
      receivedAt: new Date().toISOString(),
      rateLimitRemaining: parseRateLimitRemaining(response),
      aircraft,
    })
  } catch (error) {
    if (error instanceof GeoOpenSkyRequestError) {
      throw error
    }
    if (abortController.signal.aborted) {
      throw new GeoOpenSkyRequestError('OpenSky request timed out')
    }
    throw new GeoOpenSkyRequestError('OpenSky request failed')
  } finally {
    clearTimeout(timeout)
  }
}
