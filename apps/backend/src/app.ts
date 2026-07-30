import { randomBytes } from 'node:crypto'
import Fastify, { type FastifyServerOptions } from 'fastify'
import sensible from '@fastify/sensible'
import { registerSwagger } from './plugins/swagger.js'
import { registerResponseHandling } from './plugins/response.js'
import dbPlugin from './plugins/db.js'
import { healthRoutes } from './modules/system/health/index.js'
import { authRoutes } from './modules/system/auth/auth.routes.js'
import { JwtTokenCache } from './modules/system/auth/auth-token-cache.js'
import { userRoutes } from './modules/system/users/index.js'
import { roleRoutes } from './modules/system/roles/index.js'
import { menuRoutes } from './modules/system/menus/menus.route.js'
import { dictionaryRoutes } from './modules/system/dictionaries/index.js'
import { authorizationRoutes } from './modules/system/authorization/authorization.route.js'
import { registerAuthorization } from './modules/system/authorization/authorization.plugin.js'
import type { AuthorizationProvider } from './modules/system/authorization/authorization.provider.js'
import { departmentRoutes } from './modules/system/departments/departments.route.js'

interface AppDependencies {
  jwtSecret?: string
  authorizationProvider?: AuthorizationProvider
}

/**
 * 创建完整 Fastify 应用的组合根。测试可注入密钥和授权提供器，生产入口则使用环境配置。
 */
export async function buildApp(
  options: FastifyServerOptions = {},
  dependencies: AppDependencies = {},
) {
  const app = Fastify({
    logger: true,
    ajv: {
      customOptions: {
        // 非法字段必须由 strictObject Schema 明确拒绝，不能在校验时静默删除。
        removeAdditional: false,
      },
    },
    ...options,
  })

  // 随机密钥只服务于未传依赖的隔离测试；生产 server.ts 始终传入环境密钥。
  const jwtSecret = dependencies.jwtSecret ?? randomBytes(32).toString('base64url')
  app.decorate('authTokens', new JwtTokenCache(jwtSecret))

  app.register(sensible)
  await registerResponseHandling(app)
  await registerSwagger(app)
  app.register(dbPlugin)
  app.register(async function applicationRoutes(router) {
    // 授权插件先于路由注册，保证每条后续路由都经过元数据门禁和请求前检查。
    await registerAuthorization(router, dependencies.authorizationProvider)
    router.register(healthRoutes)
    router.register(authRoutes)
    router.register(authorizationRoutes)
    router.register(userRoutes)
    router.register(roleRoutes)
    router.register(departmentRoutes)
    router.register(menuRoutes)
    router.register(dictionaryRoutes)
  })

  return app
}
