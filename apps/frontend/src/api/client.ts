import createClient from 'openapi-fetch'
import type { paths } from '@scaffold/openapi-spec'

export const apiClient = createClient<paths>({
  baseUrl: '/api',
})
