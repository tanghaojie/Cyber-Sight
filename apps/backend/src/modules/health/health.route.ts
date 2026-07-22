import type { FastifyInstance } from 'fastify'
import type { components } from '@scaffold/openapi-spec'
import { z } from 'zod'

type HealthResponse = components['schemas']['HealthResponse']

const healthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
})

export async function healthRoutes(app: FastifyInstance) {
  app.get<{ Reply: HealthResponse }>(
    '/health',
    {
      schema: {
        operationId: 'getHealth',
        tags: ['Health'],
        summary: 'Health check',
        response: {
          200: {
            type: 'object',
            required: ['status', 'timestamp'],
            properties: {
              status: { type: 'string', enum: ['ok'] },
              timestamp: { type: 'string', format: 'date-time' },
            },
          },
        },
      },
    },
    async () => {
      return healthResponseSchema.parse({
        status: 'ok',
        timestamp: new Date().toISOString(),
      })
    }
  )
}
