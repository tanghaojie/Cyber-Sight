import {
  GeoOpenSkyStatesResponseSchema,
  type GeoOpenSkyStatesData,
  type GeoOpenSkyStatesQuery,
  type GeoOpenSkyStatesResponse,
} from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/foundation/api/client'

export async function fetchGeoOpenSkyStates(
  query: GeoOpenSkyStatesQuery,
  signal?: AbortSignal,
): Promise<GeoOpenSkyStatesData> {
  const { data, error } = await apiClient.GET<GeoOpenSkyStatesResponse>(
    '/platform/geo/open-sky/states',
    {
      query: { ...query },
      signal,
    },
  )
  if (error) {
    throw new Error(error.err)
  }

  const response = GeoOpenSkyStatesResponseSchema.safeParse(data)
  if (!response.success) {
    throw new Error('Geo OpenSky response is invalid')
  }
  return response.data.data
}
