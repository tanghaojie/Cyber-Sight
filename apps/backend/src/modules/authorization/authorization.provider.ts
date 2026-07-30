import type { CurrentUser, DataAction } from '@scaffold/api-contract'
import type { FastifyInstance } from 'fastify'
import {
  effectivePermissionKeys,
  resolveDataAccess,
  type DataAccessPlan,
} from './authorization.service.js'

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
