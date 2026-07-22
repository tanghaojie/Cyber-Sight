import { readFile } from 'node:fs/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { parse } from 'yaml'
import { buildApp } from '../src/app.js'

let app: FastifyInstance

beforeAll(async () => {
  app = await buildApp({ logger: false })
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
      status: 'ok',
      timestamp: expect.any(String),
    })
    expect(Number.isNaN(Date.parse(response.json().timestamp))).toBe(false)
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
    const runtimeSchema =
      runtimeOperation.responses['200'].content['application/json'].schema

    expect(runtimeOperation.operationId).toBe(contractOperation.operationId)
    expect(runtimeOperation.summary).toBe(contractOperation.summary)
    expect(runtimeOperation.tags).toEqual(contractOperation.tags)
    expect(runtimeSchema.required).toEqual(contractSchema.required)
    expect(runtimeSchema.properties.status.enum).toEqual(
      contractSchema.properties.status.enum
    )
    expect(runtimeSchema.properties.timestamp.format).toBe(
      contractSchema.properties.timestamp.format
    )
  })
})
