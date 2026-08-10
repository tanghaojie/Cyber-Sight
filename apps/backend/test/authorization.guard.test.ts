import { describe, expect, it } from 'vitest'
import { buildApp } from '@/app.js'
import {
  Authenticated,
  Public,
  RequirePermissions,
  routeAuthorizationKey,
} from '@/modules/system/authorization/authorization.guard.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { JwtTokenCache } from '@/modules/system/auth/auth-token-cache.js'

describe('authorization route declarations', () => {
  it('stores all three explicit authorization modes as Nest metadata', () => {
    class Routes {
      @Public()
      publicRoute() {}

      @Authenticated()
      authenticatedRoute() {}

      @RequirePermissions('system:user:list')
      permissionRoute() {}
    }

    expect(Reflect.getMetadata(routeAuthorizationKey, Routes.prototype.publicRoute)).toEqual({
      mode: 'public',
    })
    expect(Reflect.getMetadata(routeAuthorizationKey, Routes.prototype.authenticatedRoute)).toEqual(
      {
        mode: 'authenticated',
      },
    )
    expect(Reflect.getMetadata(routeAuthorizationKey, Routes.prototype.permissionRoute)).toEqual({
      mode: 'permission',
      anyOf: ['system:user:list'],
    })
  })
})

describe('authorization provider boundary', () => {
  it('rejects an authenticated request when the provider grants no matching permission', async () => {
    const app = await buildApp(
      { logger: false },
      {
        authorizationProvider: {
          async effectivePermissionKeys() {
            return []
          },
          async resolveDataAccess() {
            return { unrestricted: false, ownerUserIds: [], departmentIds: [] }
          },
          async canAccessSubject() {
            return false
          },
          async canDelegateSubjectAccess() {
            return false
          },
          async canManageUserAuthorizationContext() {
            return false
          },
        },
      },
    )
    const authTokens = app.get(JwtTokenCache)
    const issued = await authTokens.issue({
      id: '0198f31a-0000-7000-8000-000000000008',
      username: 'operator',
      displayName: 'Operator',
      roles: [{ id: '0198f31a-0000-7000-8000-000000000002', name: 'Operator' }],
    })
    const response = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'GET',
        url: '/admin/users',
        headers: { authorization: `Bearer ${issued.token}` },
      })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: ErrorCode.FORBIDDEN, err: 'Permission required' })
    await app.close()
  })
})
