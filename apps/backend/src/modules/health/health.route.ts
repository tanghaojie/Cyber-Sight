import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

const healthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
})

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
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
