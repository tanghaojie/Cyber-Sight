import { describe, expect, it, vi } from 'vitest'
import { Test } from '@nestjs/testing'
import { GeoOpenSkyStatesQuerySchema } from '@cyber-ai-forge/api-contract'
import { GeoController } from '@/platform/modules/geo/geo.controller.js'
import { GeoModule } from '@/platform/modules/geo/geo.module.js'
import {
  GeoOpenSkyRequestError,
  GeoService,
  requestOpenSkyStates,
} from '@/platform/modules/geo/geo.service.js'

const query = { lamin: 30, lomin: 120, lamax: 32, lomax: 122 }

function response(states: unknown[][], headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({ time: 1_788_121_800, states }), {
    status: 200,
    headers: { 'content-type': 'application/json', ...headers },
  })
}

describe('Geo OpenSky proxy', function geoOpenSkyProxy() {
  it('normalizes current aircraft and filters rows without a position', async function normalize() {
    const request = vi.fn(async function requestOpenSky() {
      return response(
        [
          [
            'abc123',
            ' CSN123 ',
            'China',
            1_788_121_790,
            1_788_121_795,
            121.5,
            31.2,
            9_800,
            false,
            230,
            87,
            3,
            null,
            10_100,
            '1234',
            false,
            0,
            3,
          ],
          ['def456', null, 'China', null, 1_788_121_795, null, null],
        ],
        { 'x-rate-limit-remaining': '398' },
      )
    }) as unknown as typeof fetch
    const result = await requestOpenSkyStates(query, request)

    expect(result.rateLimitRemaining).toBe(398)
    expect(result.aircraft).toEqual([
      expect.objectContaining({
        icao24: 'abc123',
        callsign: 'CSN123',
        longitude: 121.5,
        latitude: 31.2,
        geometricAltitude: 10_100,
      }),
    ])
    const requestedUrl = String(vi.mocked(request).mock.calls[0]?.[0])
    expect(requestedUrl).toContain('lamin=30')
    expect(requestedUrl).toContain('lomax=122')
  })

  it('rejects unsuccessful upstream responses', async function upstreamFailure() {
    const request = vi.fn(async function requestOpenSky() {
      return new Response('', { status: 429 })
    }) as unknown as typeof fetch
    await expect(requestOpenSkyStates(query, request)).rejects.toBeInstanceOf(
      GeoOpenSkyRequestError,
    )
  })

  it('returns a business error without converting failure to an empty list', async function controllerError() {
    const service = {
      getOpenSkyStates: vi.fn().mockRejectedValue(new GeoOpenSkyRequestError('rate limited')),
    } as unknown as GeoService
    const controller = new GeoController(service)

    await expect(controller.getOpenSkyStates(query)).resolves.toEqual({
      status: 9001,
      err: 'OpenSky live data is temporarily unavailable',
    })
  })

  it('resolves the Geo service through Nest module assembly', async function moduleAssembly() {
    const module = await Test.createTestingModule({ imports: [GeoModule] }).compile()

    expect(module.get(GeoService)).toBeInstanceOf(GeoService)
    await module.close()
  })

  it('rejects viewports that would consume global-scale anonymous queries', function viewportLimit() {
    expect(
      GeoOpenSkyStatesQuerySchema.safeParse({
        lamin: -80,
        lomin: -170,
        lamax: 80,
        lomax: 170,
      }).success,
    ).toBe(false)
  })
})
