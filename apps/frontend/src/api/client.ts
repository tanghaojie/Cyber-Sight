import createClient from 'openapi-fetch'
import type { paths } from '@scaffold/openapi-spec'
import { globalHttpErrorMiddleware } from './global-http-error.js'

export const apiClient = createClient<paths>({
  baseUrl: '/api',
})

apiClient.use(globalHttpErrorMiddleware)
