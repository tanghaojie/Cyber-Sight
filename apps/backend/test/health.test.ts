import { readFile } from 'node:fs/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { parse } from 'yaml'
import { buildApp } from '../src/app.js'
import { ErrorCode } from '../src/shared/errors/error-codes.js'

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
    }
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

  it('keeps the Fastify Swagger schema aligned with the shared OpenAPI contract', async () => {
    const contractPath = new URL(
      '../../../packages/openapi-spec/openapi.yaml',
      import.meta.url
    )
    const contract = parse(await readFile(contractPath, 'utf8'))

    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    })

    expect(response.statusCode).toBe(200)

    const runtime = response.json()
    const contractOperation = contract.paths['/health'].get
    const runtimeOperation = runtime.paths['/health'].get
    const contractSchema = contract.components.schemas.HealthResponse
    const contractDataSchema = contract.components.schemas.HealthData
    const contractErrorSchema = contract.components.schemas.ErrorResponse
    const runtimeSchema =
      runtimeOperation.responses['200'].content['application/json'].schema
    const runtimeErrorSchema =
      runtimeOperation.responses.default.content['application/json'].schema

    expect(runtimeOperation.operationId).toBe(contractOperation.operationId)
    expect(runtimeOperation.summary).toBe(contractOperation.summary)
    expect(runtimeOperation.tags).toEqual(contractOperation.tags)
    expect(runtimeSchema.required).toEqual(contractSchema.required)
    expect(runtimeSchema.properties.status.enum).toEqual(
      contractSchema.properties.status.enum
    )
    expect(runtimeSchema.properties.data.required).toEqual(
      contractDataSchema.required
    )
    expect(runtimeSchema.properties.data.properties.status.enum).toEqual(
      contractDataSchema.properties.status.enum
    )
    expect(runtimeSchema.properties.data.properties.timestamp.format).toBe(
      contractDataSchema.properties.timestamp.format
    )
    expect(runtimeErrorSchema.required).toEqual(contractErrorSchema.required)
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
    [
      '/test-external-error',
      ErrorCode.EXTERNAL_DEPENDENCY_ERROR,
      'Dependency unavailable',
    ],
  ])(
    'returns business error %s with HTTP 200',
    async (url, status, err) => {
      const response = await app.inject({ method: 'GET', url })

      expect(response.statusCode).toBe(200)
      expect(response.json()).toEqual({ status, err })
    }
  )

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
})
