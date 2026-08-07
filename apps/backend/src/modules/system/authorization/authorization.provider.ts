import { Inject, Injectable } from '@nestjs/common'
import type { CurrentUser, DataAction } from '@scaffold/api-contract'
import { AuthorizationService, type DataAccessPlan } from './authorization.service.js'

/**
 * 授权决策端口。业务路由只依赖该接口，因此本地数据实现可被外部策略服务替换。
 */
export interface AuthorizationProvider {
  effectivePermissionKeys(user: CurrentUser): Promise<string[]>
  resolveDataAccess(
    user: CurrentUser,
    resourceKey: string,
    action: DataAction,
  ): Promise<DataAccessPlan>
}

@Injectable()
export class LocalAuthorizationProvider implements AuthorizationProvider {
  constructor(@Inject(AuthorizationService) private readonly service: AuthorizationService) {}

  effectivePermissionKeys(user: CurrentUser): Promise<string[]> {
    // 默认实现只适配端口，不把本地数据表细节泄漏给调用方或路由层。
    return this.service.effectivePermissionKeys(user.id)
  }

  resolveDataAccess(
    user: CurrentUser,
    resourceKey: string,
    action: DataAction,
  ): Promise<DataAccessPlan> {
    return this.service.resolveDataAccess(user.id, resourceKey, action)
  }
}
