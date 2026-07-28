import { randomBytes } from 'node:crypto'
import Fastify, { type FastifyServerOptions } from 'fastify'
import sensible from '@fastify/sensible'
import { registerSwagger } from './plugins/swagger.js'
import { registerResponseHandling } from './plugins/response.js'
import dbPlugin from './plugins/db.js'
import { healthRoutes } from './modules/health/index.js'
import { authRoutes } from './modules/auth/auth.routes.js'
import { JwtTokenCache } from './modules/auth/auth-token-cache.js'
import { userRoutes } from './modules/users/index.js'
import { roleRoutes } from './modules/roles/index.js'
import { menuRoutes } from './modules/menus/menus.route.js'
import { dictionaryRoutes } from './modules/dictionaries/index.js'

interface AppDependencies {
  jwtSecret?: string
}

export async function buildApp(
  options: FastifyServerOptions = {},
  dependencies: AppDependencies = {}
) {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        removeAdditional: false,
      },
    },
    ...options,
  })

  const jwtSecret =
    dependencies.jwtSecret ?? randomBytes(32).toString('base64url')
  app.decorate('authTokens', new JwtTokenCache(jwtSecret))

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
