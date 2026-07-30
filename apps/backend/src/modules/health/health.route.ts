import type { FastifyInstance } from 'fastify'
import {
  ErrorResponseSchema,
  HealthResponseSchema,
  toFastifySchema,
  type HealthResponse,
} from '@scaffold/api-contract'
import { success } from '@/shared/http/response.js'

async function getHealth(): Promise<HealthResponse> {
  return success({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Reply: HealthResponse }>(
    '/health',
    {
      config: { authorization: { mode: 'public' } },
      schema: {
        operationId: 'getHealth',
        tags: ['Health'],
        summary: 'Health check',
        security: [],
        response: {
          200: toFastifySchema(HealthResponseSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    getHealth,
  )
}
