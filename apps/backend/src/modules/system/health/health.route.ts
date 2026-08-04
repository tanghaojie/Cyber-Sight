import type { FastifyInstance } from 'fastify'
import {
  ErrorResponseSchema,
  HealthResponseSchema,
  toFastifySchema,
  type HealthResponse,
} from '@scaffold/api-contract'
import { success } from '@/shared/http/response.js'

// 存活检查不访问数据库或其他依赖，专门回答 Fastify 进程能否响应请求。
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
      config: { authorization: { mode: 'public' }, apiLog: { enabled: false } },
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
