import type { CurrentUser } from '@scaffold/api-contract'
import type { FastifyInstance } from 'fastify'
import { requireCurrentUser } from '@/modules/system/auth/auth.service.js'
import { LocalAuthorizationProvider, type AuthorizationProvider } from './authorization.provider.js'

/** 每条路由必须显式声明公开、仅认证或需要任一功能权限。 */
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
  // Provider 在应用组合时注入；业务路由始终经 app.authorization 使用同一决策边界。
  app.decorate('authorization', provider)
  // 注册阶段即拒绝遗漏授权元数据的路由，避免新接口因开发疏忽默认公开。
  app.addHook('onRoute', function requireAuthorizationMetadata(routeOptions) {
    if (!routeOptions.config?.authorization) {
      throw new Error(
        `Route ${routeOptions.method.toString()} ${routeOptions.url} must declare authorization metadata`,
      )
    }
  })
  app.addHook('preHandler', async function authorizeRequest(request) {
    // public 路由故意不解析令牌，避免把可选身份隐式变成认证依赖。
    const authorization = request.routeOptions.config.authorization
    if (!authorization || authorization.mode === 'public') {
      return
    }
    const user = await requireCurrentUser(app, request)
    // 通过认证后缓存到当前请求，后续处理器可直接取得已验证的操作者。
    request.accessUser = user
    // 权限不缓存到 JWT；每个受保护请求都委托 Provider 解析，使授权变更在下一次请求生效。
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
