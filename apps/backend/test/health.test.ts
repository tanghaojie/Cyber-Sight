import {
  BadGatewayException,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  HttpException,
  InternalServerErrorException,
  Query,
  UnauthorizedException,
} from '@nestjs/common'
import type { NestFastifyApplication } from '@nestjs/platform-fastify'
import { ListQuerySchema, LoginRequestSchema, toJsonSchema } from '@scaffold/api-contract'
import { z } from 'zod'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from '@/app.js'
import { Public } from '@/modules/system/authorization/authorization.guard.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { BackendRuntime } from '@/shared/runtime/backend-runtime.js'

const TestQuerySchema = z.strictObject({ value: z.string() })

@Controller()
class TestErrorController {
  @Get('/test-error')
  @Public()
  internalError() {
    throw new InternalServerErrorException('test-only failure')
  }

  @Get('/test-unauthorized')
  @Public()
  unauthorized() {
    throw new UnauthorizedException('Authentication required')
  }

  @Get('/test-forbidden')
  @Public()
  forbidden() {
    throw new ForbiddenException('Operation forbidden')
  }

  @Get('/test-conflict')
  @Public()
  conflict() {
    throw new ConflictException('Resource conflict')
  }

  @Get('/test-rate-limit')
  @Public()
  rateLimit() {
    throw new HttpException('Too many requests', 429)
  }

  @Get('/test-external-error')
  @Public()
  externalError() {
    throw new BadGatewayException('Dependency unavailable')
  }

  @Get('/test-validation')
  @Public()
  validation(
    @Query(new ZodValidationPipe(TestQuerySchema)) _query: z.infer<typeof TestQuerySchema>,
  ) {
    return { status: ErrorCode.SUCCESS }
  }
}

let nestApp: NestFastifyApplication
let app: FastifyInstance
let runtime: BackendRuntime

beforeAll(async () => {
  nestApp = await buildApp(
    { logger: false },
    {
      controllers: [TestErrorController],
      authorizationProvider: {
        async effectivePermissionKeys() {
          return ['users.manage']
        },
        async resolveDataAccess() {
          return { unrestricted: true, ownerUserIds: [], departmentIds: [] }
        },
      },
    },
  )
  app = nestApp.getHttpAdapter().getInstance()
  runtime = nestApp.get(BackendRuntime)
})

afterAll(async () => {
  await nestApp.close()
})

describe('Nest application HTTP compatibility', () => {
  it('returns the service health status without opening a network port', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' })

    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({
      status: ErrorCode.SUCCESS,
      data: { status: 'ok', timestamp: expect.any(String) },
    })
    expect(Number.isNaN(Date.parse(response.json().data.timestamp))).toBe(false)
  })

  it('converts Zod contracts to adapter-neutral Draft 7 schemas', () => {
    const loginSchema = toJsonSchema(LoginRequestSchema)
    const listQuerySchema = toJsonSchema(ListQuerySchema)

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
        pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
      },
    })
  })

  it('generates Swagger from the shared contracts', async () => {
    const response = await app.inject({ method: 'GET', url: '/docs/json' })
    expect(response.statusCode).toBe(200)

    const document = response.json()
    const health = document.paths['/health'].get
    const login = document.paths['/auth/login'].post.requestBody.content['application/json'].schema
    expect(health).toMatchObject({
      operationId: 'getHealth',
      summary: 'Health check',
      tags: ['Health'],
    })
    expect(login).toMatchObject({
      additionalProperties: false,
      required: ['username', 'password'],
      properties: {
        username: { minLength: 2 },
        password: { minLength: 8 },
      },
    })
  })

  it('exposes every authentication and management operation', async () => {
    const document = (await app.inject({ method: 'GET', url: '/docs/json' })).json()
    const operations = [
      ['/auth/login', 'post', 'login'],
      ['/auth/logout', 'post', 'logout'],
      ['/auth/me', 'get', 'getCurrentUser'],
      ['/account/profile', 'get', 'getPersonalProfile'],
      ['/account/profile', 'put', 'updatePersonalProfile'],
      ['/account/password', 'put', 'updatePersonalPassword'],
      ['/admin/api-logs', 'get', 'listApiLogs'],
      ['/admin/users', 'get', 'listUsers'],
      ['/admin/users', 'post', 'createUser'],
      ['/admin/users/{id}', 'put', 'updateUser'],
      ['/admin/users/{id}', 'delete', 'deleteUser'],
      ['/admin/roles', 'get', 'listRoles'],
      ['/admin/roles', 'post', 'createRole'],
      ['/admin/roles/{id}', 'put', 'updateRole'],
      ['/admin/roles/{id}', 'delete', 'deleteRole'],
      ['/admin/departments', 'get', 'listDepartments'],
      ['/admin/departments', 'post', 'createDepartment'],
      ['/admin/departments/{id}', 'put', 'updateDepartment'],
      ['/admin/departments/{id}', 'delete', 'deleteDepartment'],
      ['/admin/authorization/permissions', 'get', 'listAuthorizationPermissions'],
      ['/admin/authorization/data-resources', 'get', 'listAuthorizationDataResources'],
      ['/admin/authorization/users/{id}', 'get', 'getUserAccess'],
      ['/admin/authorization/users/{id}', 'put', 'replaceUserAccess'],
      ['/admin/authorization/roles/{id}', 'get', 'getRoleAccess'],
      ['/admin/authorization/roles/{id}', 'put', 'replaceRoleAccess'],
      ['/admin/authorization/departments/{id}', 'get', 'getDepartmentAccess'],
      ['/admin/authorization/departments/{id}', 'put', 'replaceDepartmentAccess'],
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
      expect(document.paths[path][method].operationId).toBe(operationId)
    }
  })

  it('documents JWT globally and marks public operations as public', async () => {
    const document = (await app.inject({ method: 'GET', url: '/docs/json' })).json()
    expect(document.components.securitySchemes.bearerAuth).toEqual({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    })
    expect(document.security).toEqual([{ bearerAuth: [] }])
    expect(document.paths['/auth/me'].get.security).toEqual([{ bearerAuth: [] }])
    expect(document.paths['/auth/login'].post.security).toEqual([])
    expect(document.paths['/health'].get.security).toEqual([])
  })

  it('authenticates with and revokes a bearer token', async () => {
    const currentUser = {
      id: 2,
      username: 'operator',
      displayName: 'Operator',
      roles: [{ id: 2, name: 'User' }],
    }
    const issued = await runtime.authTokens.issue(currentUser)
    const headers = { authorization: `Bearer ${issued.token}` }
    const me = await app.inject({ method: 'GET', url: '/auth/me', headers })
    expect(me.json()).toEqual({ status: 0, data: currentUser })

    const originalDb = runtime.db
    const updateWhere = vi.fn().mockResolvedValue([])
    const update = vi.fn(() => ({ set: vi.fn(() => ({ where: updateWhere })) }))
    runtime.db = { update } as unknown as BackendRuntime['db']
    try {
      const logout = await app.inject({ method: 'POST', url: '/auth/logout', headers })
      expect(logout.json()).toEqual({ status: 0 })
      expect(update).toHaveBeenCalledOnce()
      await expect(runtime.authTokens.resolve(issued.token, async () => null)).resolves.toBeNull()
    } finally {
      runtime.db = originalDb
    }
  })

  it('enforces strict request contracts and coerces HTTP query numbers', async () => {
    const undeclared = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { username: 'admin', password: 'Admin@123456', isAdmin: true },
    })
    expect(undeclared.json()).toEqual({ status: ErrorCode.INVALID_REQUEST, err: 'Invalid request' })

    const issued = await runtime.authTokens.issue({
      id: 3,
      username: 'reader',
      displayName: 'Reader',
      roles: [],
    })
    const pagination = await app.inject({
      method: 'GET',
      url: '/admin/users?pageSize=101',
      headers: { authorization: `Bearer ${issued.token}` },
    })
    expect(pagination.json()).toEqual({ status: ErrorCode.INVALID_REQUEST, err: 'Invalid request' })
  })

  it('returns unified not-found and hidden internal-error responses', async () => {
    const missing = await app.inject({ method: 'GET', url: '/missing-route' })
    expect(missing.statusCode).toBe(404)
    expect(missing.json()).toEqual({
      status: ErrorCode.RESOURCE_NOT_FOUND,
      err: 'Resource not found',
    })

    const internal = await app.inject({ method: 'GET', url: '/test-error' })
    expect(internal.statusCode).toBe(500)
    expect(internal.json()).toEqual({
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
  ])('maps %s to a business error response', async (url, status, err) => {
    const response = await app.inject({ method: 'GET', url })
    expect(response.statusCode).toBe(200)
    expect(response.json()).toEqual({ status, err })
  })

  it('preserves HTTP 401 for authentication handling', async () => {
    const response = await app.inject({ method: 'GET', url: '/test-unauthorized' })
    expect(response.statusCode).toBe(401)
    expect(response.json()).toEqual({
      status: ErrorCode.UNAUTHORIZED,
      err: 'Authentication required',
    })
  })

  it.each([
    ['GET', '/auth/me'],
    ['POST', '/auth/logout'],
    ['GET', '/account/profile'],
    ['GET', '/admin/users'],
    ['GET', '/admin/roles'],
    ['GET', '/admin/departments'],
    ['GET', '/admin/authorization/permissions'],
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
