import type { CurrentUser, DataAction } from '@scaffold/api-contract'
import type { FastifyInstance } from 'fastify'
import {
  effectivePermissionKeys,
  resolveDataAccess,
  type DataAccessPlan,
} from './authorization.service.js'

/**
 * 授权决策端口。业务路由只依赖该接口，因此本地数据库实现可被外部策略服务替换。
 */
export interface AuthorizationProvider {
  effectivePermissionKeys(app: FastifyInstance, user: CurrentUser): Promise<string[]>
  resolveDataAccess(
    app: FastifyInstance,
    user: CurrentUser,
    resourceKey: string,
    action: DataAction,
  ): Promise<DataAccessPlan>
}

export class LocalAuthorizationProvider implements AuthorizationProvider {
  effectivePermissionKeys(app: FastifyInstance, user: CurrentUser): Promise<string[]> {
    // 默认实现只适配端口，不把本地数据表细节泄漏给调用方或路由层。
    return effectivePermissionKeys(app, user.id)
  }

  resolveDataAccess(
    app: FastifyInstance,
    user: CurrentUser,
    resourceKey: string,
    action: DataAction,
  ): Promise<DataAccessPlan> {
    return resolveDataAccess(app, user.id, resourceKey, action)
  }
}
