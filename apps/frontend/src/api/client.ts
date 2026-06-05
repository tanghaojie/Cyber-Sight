import createClient from 'openapi-fetch'
import type { paths } from '../api-types/schema.js'

export const apiClient = createClient<paths>({
  baseUrl: '/api',
})
