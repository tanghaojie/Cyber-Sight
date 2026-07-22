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
})
