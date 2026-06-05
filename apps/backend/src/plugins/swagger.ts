import type { FastifyInstance } from 'fastify'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'

export async function registerSwagger(app: FastifyInstance) {
  await app.register(swagger, {
    openapi: {
      info: {
        title: 'AI Web Scaffold API',
        version: '0.1.0',
        description: 'AI-friendly web scaffold — spec-first, type-safe',
      },
      servers: [{ url: 'http://localhost:3000' }],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { deepLinking: true },
  })
}
