import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '@/app.js'
import { ApiLogWriter } from '@/modules/system/api-logs/api-logs.service.js'

describe('API log request hooks', () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined

  afterEach(async () => {
    await app?.close()
  })

  it('permanently records invalid login attempts without retaining a password', async () => {
    const insert = vi.fn().mockResolvedValue(undefined)
    const writer = new ApiLogWriter(
      { insert, deleteExpired: vi.fn().mockResolvedValue(0) },
      { error: vi.fn() },
    )
    app = await buildApp({ logger: false }, { apiLogWriter: writer })

    const response = await app
      .getHttpAdapter()
      .getInstance()
      .inject({
        method: 'POST',
        url: '/auth/login',
        payload: { username: 'admin', password: 'short' },
      })
    await writer.flushNow()

    expect(response.statusCode).toBe(200)
    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        actorUsername: 'admin',
        businessStatus: 1000,
        expiresAt: null,
        routePattern: '/auth/login',
      }),
    ])
    expect(insert.mock.calls[0]?.[0]?.[0]).not.toHaveProperty('password')
  })

  it('excludes health checks and records unmatched routes as temporary logs', async () => {
    const insert = vi.fn().mockResolvedValue(undefined)
    const writer = new ApiLogWriter(
      { insert, deleteExpired: vi.fn().mockResolvedValue(0) },
      { error: vi.fn() },
    )
    app = await buildApp({ logger: false }, { apiLogWriter: writer })
    const fastify = app.getHttpAdapter().getInstance()

    await fastify.inject({ method: 'GET', url: '/health' })
    await writer.flushNow()
    expect(insert).not.toHaveBeenCalled()

    await fastify.inject({ method: 'GET', url: '/unknown-api' })
    await writer.flushNow()

    expect(insert).toHaveBeenCalledWith([
      expect.objectContaining({
        expiresAt: expect.any(Date),
        httpStatus: 404,
        routePattern: '__unmatched__',
      }),
    ])
  })
})
