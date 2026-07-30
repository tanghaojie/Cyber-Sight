import type { CurrentUser } from '@scaffold/api-contract'
import type { FastifyInstance } from 'fastify'
import { requireCurrentUser } from '@/modules/auth/auth.service.js'
import { LocalAuthorizationProvider, type AuthorizationProvider } from './authorization.provider.js'

export type RouteAuthorization =
  { mode: 'public' } | { mode: 'authenticated' } | { mode: 'permission'; anyOf: string[] }

declare module 'fastify' {
  interface FastifyContextConfig {
    authorization?: RouteAuthorization
  }

  interface FastifyRequest {
    accessUser?: CurrentUser
  }

  interface FastifyInstance {
    authorization: AuthorizationProvider
  }
}

export async function registerAuthorization(
  app: FastifyInstance,
  provider: AuthorizationProvider = new LocalAuthorizationProvider(),
): Promise<void> {
  app.decorate('authorization', provider)
  app.addHook('onRoute', function requireAuthorizationMetadata(routeOptions) {
    if (!routeOptions.config?.authorization) {
      throw new Error(
        `Route ${routeOptions.method.toString()} ${routeOptions.url} must declare authorization metadata`,
      )
    }
  })
  app.addHook('preHandler', async function authorizeRequest(request) {
    const authorization = request.routeOptions.config.authorization
    if (!authorization || authorization.mode === 'public') {
      return
    }
    const user = await requireCurrentUser(app, request)
    request.accessUser = user
    if (
      authorization.mode === 'permission' &&
      !(await provider.effectivePermissionKeys(app, user)).some((key) =>
        authorization.anyOf.includes(key),
      )
    ) {
      throw app.httpErrors.forbidden('Permission required')
    }
  })
}
