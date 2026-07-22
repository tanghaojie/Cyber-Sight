import type { FastifyInstance } from 'fastify'
import type { components } from '@scaffold/openapi-spec'
import { z } from 'zod'
import { success } from '../../shared/http/response.js'

type HealthResponse = components['schemas']['HealthResponse']
type HealthData = components['schemas']['HealthData']

const healthDataSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
})

async function getHealth(): Promise<HealthResponse> {
  const data: HealthData = healthDataSchema.parse({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })

  return success(data)
}

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
            required: ['status', 'data'],
            properties: {
              status: { type: 'integer', enum: [0] },
              data: {
                type: 'object',
                required: ['status', 'timestamp'],
                properties: {
                  status: { type: 'string', enum: ['ok'] },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
              err: { type: 'string' },
            },
          },
          default: {
            type: 'object',
            required: ['status', 'err'],
            properties: {
              status: { type: 'integer', minimum: 1 },
              err: { type: 'string' },
            },
          },
        },
      },
    },
    getHealth
  )
}
