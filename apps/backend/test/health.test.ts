import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { ListQuerySchema, LoginRequestSchema, toFastifySchema } from '@scaffold/api-contract'
import { buildApp } from '@/app.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp({ logger: false })
  app.get('/test-error', async function throwTestError() {
    throw new Error('test-only failure')
  })
  app.get('/test-unauthorized', async function throwUnauthorized() {
    throw app.httpErrors.unauthorized('Authentication required')
  })
  app.get('/test-forbidden', async function throwForbidden() {
    throw app.httpErrors.forbidden('Operation forbidden')
  })
  app.get('/test-conflict', async function throwConflict() {
    throw app.httpErrors.conflict('Resource conflict')
  })
  app.get('/test-rate-limit', async function throwRateLimit() {
    throw app.httpErrors.tooManyRequests('Too many requests')
  })
  app.get('/test-external-error', async function throwExternalError() {
    throw app.httpErrors.badGateway('Dependency unavailable')
  })
  app.get(
    '/test-validation',
    {
      schema: {
        querystring: {
          type: 'object',
          required: ['value'],
          properties: { value: { type: 'string' } },
        },
      },
    },
    async function validationRoute() {
      return { status: ErrorCode.SUCCESS }
    },
  )
})

afterAll(async () => {
  await app.close()
})

describe('GET /health', () => {
  it('returns the service health status without opening a network port', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      status: ErrorCode.SUCCESS,
      data: {
        status: 'ok',
        timestamp: expect.any(String),
      },
    })
    expect(Number.isNaN(Date.parse(response.json().data.timestamp))).toBe(false)
  })

  it('converts Zod contracts to Fastify-compatible Draft 7 schemas', () => {
    const loginSchema = toFastifySchema(LoginRequestSchema)
    const listQuerySchema = toFastifySchema(ListQuerySchema)

    expect(loginSchema).not.toHaveProperty('$schema')
    expect(loginSchema).toMatchObject({
      type: 'object',
      additionalProperties: false,
      required: ['username', 'password'],
      properties: {
        username: { type: 'string', minLength: 2, maxLength: 50 },
        password: { type: 'string', minLength: 8, maxLength: 128 },
      },
    })
    expect(listQuerySchema).toMatchObject({
      additionalProperties: false,
      properties: {
        pageNum: { type: 'integer', minimum: 1, default: 1 },
        pageSize: {
          type: 'integer',
          minimum: 1,
          maximum: 100,
          default: 10,
        },
      },
    })
  })

  it('generates Swagger from the runtime route schemas', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    })

    expect(response.statusCode).toBe(200)

    const runtime = response.json()
    const health = runtime.paths['/health'].get
    const login = runtime.paths['/auth/login'].post.requestBody.content['application/json'].schema

    expect(health.operationId).toBe('getHealth')
    expect(health.summary).toBe('Health check')
    expect(health.tags).toEqual(['Health'])
    expect(login.additionalProperties).toBe(false)
    expect(login.required).toEqual(['username', 'password'])
    expect(login.properties.username.minLength).toBe(2)
    expect(login.properties.password.minLength).toBe(8)
  })

  it('exposes every authentication and management operation', async () => {
    const runtimeResponse = await app.inject({ method: 'GET', url: '/docs/json' })
    const runtime = runtimeResponse.json()
    const operations = [
      ['/auth/login', 'post', 'login'],
      ['/auth/logout', 'post', 'logout'],
      ['/auth/me', 'get', 'getCurrentUser'],
      ['/admin/users', 'get', 'listUsers'],
      ['/admin/users', 'post', 'createUser'],
      ['/admin/users/{id}', 'put', 'updateUser'],
      ['/admin/users/{id}', 'delete', 'deleteUser'],
      ['/admin/roles', 'get', 'listRoles'],
      ['/admin/roles', 'post', 'createRole'],
      ['/admin/roles/{id}', 'put', 'updateRole'],
      ['/admin/roles/{id}', 'delete', 'deleteRole'],
      ['/admin/menus', 'get', 'listMenus'],
      ['/admin/menus', 'post', 'createMenu'],
      ['/admin/menus/{id}', 'put', 'updateMenu'],
      ['/admin/menus/{id}', 'delete', 'deleteMenu'],
      ['/admin/dictionaries', 'get', 'listDictionaries'],
      ['/admin/dictionaries', 'post', 'createDictionary'],
      ['/admin/dictionaries/{id}', 'put', 'updateDictionary'],
      ['/admin/dictionaries/{id}', 'delete', 'deleteDictionary'],
    ] as const

    for (const [path, method, operationId] of operations) {
      expect(runtime.paths[path][method].operationId).toBe(operationId)
    }
  })

  it('documents and accepts JWT bearer authentication without a session query', async () => {
    const currentUser = {
      id: 1,
      username: 'admin',
      displayName: '系统管理员',
      roles: ['SUPER_ADMIN'],
    }
    const issued = await app.authTokens.issue(currentUser)
    const response = await app.inject({
      method: 'GET',
      url: '/auth/me',
      headers: { authorization: `Bearer ${issued.token}` },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status: 0, data: currentUser })

    const runtime = (await app.inject({ method: 'GET', url: '/docs/json' })).json()
    expect(runtime.components.securitySchemes.bearerAuth).toEqual({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    expect(runtime.paths['/auth/me'].get.security).toEqual([{ bearerAuth: [] }])
    expect(runtime.security).toEqual([{ bearerAuth: [] }])
    expect(runtime.paths['/auth/login'].post.security).toEqual([])
    expect(runtime.paths['/health'].get.security).toEqual([])
  })

  it('revokes the current bearer token on logout', async () => {
    const issued = await app.authTokens.issue({
      id: 2,
      username: 'operator',
      displayName: 'Operator',
      roles: ['USER'],
    })
    const headers = { authorization: `Bearer ${issued.token}` }
    const originalDb = app.db
    const updateWhere = vi.fn().mockResolvedValue([])
    const update = vi.fn(() => ({
      set: vi.fn(() => ({ where: updateWhere })),
    }))
    app.db = { update } as unknown as FastifyInstance['db']

    try {
      const logout = await app.inject({
        method: 'POST',
        url: '/auth/logout',
        headers,
      })

      expect(logout.statusCode).toBe(200)
      expect(logout.json()).toEqual({ status: 0 })
      expect(update).toHaveBeenCalledOnce()
      expect(updateWhere).toHaveBeenCalledOnce()
      await expect(app.authTokens.resolve(issued.token, async () => null)).resolves.toBeNull()
    } finally {
      app.db = originalDb
    }
  })

  it('rejects undeclared login fields at the HTTP boundary', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: {
        username: 'admin',
        password: 'Admin@123456',
        isAdmin: true,
      },
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      status: ErrorCode.INVALID_REQUEST,
      err: 'Invalid request',
    })
  })

  it('rejects pagination values outside the shared runtime schema', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/admin/users?pageSize=101',
    })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      status: ErrorCode.INVALID_REQUEST,
      err: 'Invalid request',
    })
  })

  it('returns a unified not-found response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/missing-route',
    })

    expect(response.statusCode).toBe(404)
    expect(response.json()).toEqual({
      status: ErrorCode.RESOURCE_NOT_FOUND,
      err: 'Resource not found',
    })
  })

  it('hides internal error details behind the unified response', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-error',
    })

    expect(response.statusCode).toBe(500)
    expect(response.json()).toEqual({
      status: ErrorCode.INTERNAL_ERROR,
      err: 'Internal server error',
    })
  })

  it.each([
    ['/test-validation', ErrorCode.INVALID_REQUEST, 'Invalid request'],
    ['/test-forbidden', ErrorCode.FORBIDDEN, 'Operation forbidden'],
    ['/test-conflict', ErrorCode.RESOURCE_CONFLICT, 'Resource conflict'],
    ['/test-rate-limit', ErrorCode.RATE_LIMITED, 'Too many requests'],
    ['/test-external-error', ErrorCode.EXTERNAL_DEPENDENCY_ERROR, 'Dependency unavailable'],
  ])('returns business error %s with HTTP 200', async (url, status, err) => {
    const response = await app.inject({ method: 'GET', url })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status, err })
  })

  it('preserves HTTP 401 for global authentication handling', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/test-unauthorized',
    })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({
      status: ErrorCode.UNAUTHORIZED,
      err: 'Authentication required',
    })
  })

  it.each([
    ['GET', '/auth/me'],
    ['POST', '/auth/logout'],
    ['GET', '/admin/users'],
    ['GET', '/admin/roles'],
    ['GET', '/admin/menus'],
    ['GET', '/admin/dictionaries'],
  ] as const)('protects %s %s when no bearer token is present', async (method, url) => {
    const response = await app.inject({ method, url })

    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({
      status: ErrorCode.UNAUTHORIZED,
      err: 'Authentication required',
    })
  })
})
