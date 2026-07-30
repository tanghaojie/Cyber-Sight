import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import { describe, expect, it } from 'vitest'
import { registerAuthorization } from '@/modules/authorization/authorization.plugin.js'
import { buildApp } from '@/app.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'

describe('authorization route declarations', () => {
  it('rejects a business route without explicit authorization metadata', async () => {
    const app = Fastify({ logger: false })
    await app.register(sensible)
    await registerAuthorization(app)

    expect(() => app.get('/undeclared', async () => ({ status: 0 }))).toThrow(
      'must declare authorization metadata',
    )
    await app.close()
  })

  it('accepts public, authenticated and permission declarations', async () => {
    const app = Fastify({ logger: false })
    await app.register(sensible)
    await registerAuthorization(app)

    expect(() =>
      app.get('/public', { config: { authorization: { mode: 'public' } } }, async () => ({
        status: 0,
      })),
    ).not.toThrow()
    await app.close()
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
        },
      },
    )
    const issued = await app.authTokens.issue({
      id: 8,
      username: 'operator',
      displayName: 'Operator',
      roles: ['OPERATOR'],
    })
    const response = await app.inject({
      method: 'GET',
      url: '/admin/users',
      headers: { authorization: `Bearer ${issued.token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: ErrorCode.FORBIDDEN, err: 'Permission required' })
    await app.close()
  })
})
