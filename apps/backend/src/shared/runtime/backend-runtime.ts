import type { Database } from '@/db/index.js'
import type { JwtTokenCache } from '@/modules/system/auth/auth-token-cache.js'
import type { AuthorizationProvider } from '@/modules/system/authorization/authorization.provider.js'

/**
 * Nest 组合根注入的最小运行时上下文。业务函数只依赖显式能力，不再把 HTTP 框架实例当作服务容器。
 */
export class BackendRuntime {
  constructor(
    public db: Database,
    public authTokens: JwtTokenCache,
    public authorization: AuthorizationProvider,
  ) {}
}
