import Fastify, { type FastifyServerOptions } from 'fastify'
import sensible from '@fastify/sensible'
import { registerSwagger } from './plugins/swagger.js'
import { registerResponseHandling } from './plugins/response.js'
import dbPlugin from './plugins/db.js'
import { healthRoutes } from './modules/health/health.route.js'

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({ logger: true, ...options })

  app.register(sensible)
  await registerResponseHandling(app)
  await registerSwagger(app)
  app.register(dbPlugin)
  app.register(healthRoutes)

  return app
}
