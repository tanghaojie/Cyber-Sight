import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildApp } from '@/app.js'

describe('API log request hooks', () => {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined

  afterEach(async () => {
    await app?.close()
  })

  it('permanently records invalid login attempts without retaining a password', async () => {
    app = await buildApp({ logger: false })
    const values = vi.fn().mockResolvedValue(undefined)
    app.db = { insert: vi.fn(() => ({ values })) } as typeof app.db

    const response = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { username: 'admin', password: 'short' },
    })
    await app.apiLogWriter.flushNow()

    expect(response.statusCode).toBe(200)
    expect(values).toHaveBeenCalledWith([
      expect.objectContaining({
        actorUsername: 'admin',
        businessStatus: 1000,
        expiresAt: null,
        routePattern: '/auth/login',
      }),
    ])
    expect(values.mock.calls[0]?.[0]?.[0]).not.toHaveProperty('password')
  })

  it('excludes health checks and records unmatched routes as temporary logs', async () => {
    app = await buildApp({ logger: false })
    const values = vi.fn().mockResolvedValue(undefined)
    app.db = { insert: vi.fn(() => ({ values })) } as typeof app.db

    await app.inject({ method: 'GET', url: '/health' })
    await app.apiLogWriter.flushNow()
    expect(values).not.toHaveBeenCalled()

    await app.inject({ method: 'GET', url: '/unknown-api' })
    await app.apiLogWriter.flushNow()

    expect(values).toHaveBeenCalledWith([
      expect.objectContaining({
        expiresAt: expect.any(Date),
        httpStatus: 404,
        routePattern: '__unmatched__',
      }),
    ])
  })
})
