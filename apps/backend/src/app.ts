import Fastify, { type FastifyServerOptions } from 'fastify'
import sensible from '@fastify/sensible'
import { registerSwagger } from './plugins/swagger.js'
import { registerResponseHandling } from './plugins/response.js'
import dbPlugin from './plugins/db.js'
import { healthRoutes } from './modules/health/index.js'
import { authRoutes } from './modules/auth/index.js'
import { userRoutes } from './modules/users/index.js'
import { roleRoutes } from './modules/roles/index.js'
import { menuRoutes } from './modules/menus/index.js'
import { dictionaryRoutes } from './modules/dictionaries/index.js'

export async function buildApp(options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
    ...options,
  })

  app.register(sensible)
  await registerResponseHandling(app)
  await registerSwagger(app)
  app.register(dbPlugin)
  app.register(healthRoutes)
  app.register(authRoutes)
  app.register(userRoutes)
  app.register(roleRoutes)
  app.register(menuRoutes)
  app.register(dictionaryRoutes)

  return app
}
