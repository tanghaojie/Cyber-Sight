import type { FastifyInstance } from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

/** Swagger 文档直接消费各路由从共享 Zod 契约派生的 JSON Schema。 */
export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Cyber Scaffold API',
        version: '0.1.0',
        description: 'CYBER management scaffold — runtime-safe, modular, and AI-native',
      },
      servers: [{ url: 'http://localhost:3000' }],
      security: [{ bearerAuth: [] }],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
          },
        },
      },
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { deepLinking: true },
  })
}
