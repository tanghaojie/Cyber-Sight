import { z } from 'zod'
import { apiResponseSchema, ErrorResponseSchema } from '@/foundation/http/http.js'

const LatitudeSchema = z.number().min(-90).max(90)
const LongitudeSchema = z.number().min(-180).max(180)
export const GEO_OPEN_SKY_MAX_VIEWPORT_AREA = 400

export const GeoOpenSkyStatesQuerySchema = z
  .strictObject({
    lamin: z.coerce.number().min(-90).max(90),
    lomin: z.coerce.number().min(-180).max(180),
    lamax: z.coerce.number().min(-90).max(90),
    lomax: z.coerce.number().min(-180).max(180),
  })
  .refine((value) => value.lamin < value.lamax, {
    message: 'lamin must be less than lamax',
    path: ['lamin'],
  })
  .refine((value) => value.lomin < value.lomax, {
    message: 'lomin must be less than lomax',
    path: ['lomin'],
  })
  .refine(
    (value) =>
      (value.lamax - value.lamin) * (value.lomax - value.lomin) <= GEO_OPEN_SKY_MAX_VIEWPORT_AREA,
    {
      message: `viewport area must not exceed ${GEO_OPEN_SKY_MAX_VIEWPORT_AREA} square degrees`,
      path: ['lamax'],
    },
  )

export const GeoOpenSkyAircraftStateSchema = z.strictObject({
  icao24: z.string().regex(/^[0-9a-f]{6}$/),
  callsign: z.string().min(1).nullable(),
  originCountry: z.string().min(1),
  timePosition: z.number().int().min(0).nullable(),
  lastContact: z.number().int().min(0),
  longitude: LongitudeSchema,
  latitude: LatitudeSchema,
  barometricAltitude: z.number().nullable(),
  geometricAltitude: z.number().nullable(),
  onGround: z.boolean(),
  velocity: z.number().min(0).nullable(),
  trueTrack: z.number().min(0).max(360).nullable(),
  verticalRate: z.number().nullable(),
  category: z.number().int().min(0).nullable(),
})

export const GeoOpenSkyStatesDataSchema = z.strictObject({
  sourceTime: z.number().int().min(0),
  receivedAt: z.iso.datetime(),
  rateLimitRemaining: z.number().int().min(0).nullable(),
  aircraft: z.array(GeoOpenSkyAircraftStateSchema),
})

export const GeoOpenSkyStatesResponseSchema = apiResponseSchema(GeoOpenSkyStatesDataSchema)
export const GeoOpenSkyStatesResultSchema = z.union([
  GeoOpenSkyStatesResponseSchema,
  ErrorResponseSchema,
])

export type GeoOpenSkyStatesQuery = z.infer<typeof GeoOpenSkyStatesQuerySchema>
export type GeoOpenSkyAircraftState = z.infer<typeof GeoOpenSkyAircraftStateSchema>
export type GeoOpenSkyStatesData = z.infer<typeof GeoOpenSkyStatesDataSchema>
export type GeoOpenSkyStatesResponse = z.infer<typeof GeoOpenSkyStatesResponseSchema>
export type GeoOpenSkyStatesResult = z.infer<typeof GeoOpenSkyStatesResultSchema>
