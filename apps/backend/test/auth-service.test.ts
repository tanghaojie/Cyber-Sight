import type { FastifyInstance, FastifyRequest } from 'fastify'
import { describe, expect, it, vi } from 'vitest'
import {
  authenticateCredentials,
  currentUserFromRequest,
} from '@/modules/system/auth/auth.service.js'
import { JwtTokenCache } from '@/modules/system/auth/auth-token-cache.js'
import { hashPassword, hashSessionToken } from '@/modules/system/auth/auth.security.js'

const SECRET = 'test-only-jwt-secret-at-least-32-characters'

// 验证登录签发必须落库，内存淘汰后仍可从有效持久会话恢复且只恢复一次。
describe('authentication service persistence cache', () => {
  it('persists a one-way token hash when credentials are authenticated', async () => {
    const password = 'StrongPassword!123'
    const userRow = {
      id: 7,
      username: 'operator',
      displayName: 'Operator',
      passwordHash: await hashPassword(password),
    }
    const select = vi
      .fn()
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          where: vi.fn(() => ({
            limit: vi.fn().mockResolvedValue([userRow]),
          })),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({ orderBy: vi.fn().mockResolvedValue([{ id: 3, name: '用户' }]) })),
          })),
        })),
      })
    const insertValues = vi.fn().mockResolvedValue([])
    const app = {
      authTokens: new JwtTokenCache(SECRET),
      db: {
        insert: vi.fn(() => ({ values: insertValues })),
        select,
        update: vi.fn(() => ({
          set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
        })),
      },
    } as unknown as FastifyInstance

    const result = await authenticateCredentials(app, userRow.username, password)

    expect(result?.user).toEqual({
      id: 7,
      username: 'operator',
      displayName: 'Operator',
      roles: [{ id: 3, name: '用户' }],
    })
    expect(result?.issued?.token).toEqual(expect.any(String))
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 7,
        tokenHash: hashSessionToken(result?.issued?.token ?? ''),
        expiresAt: expect.any(Date),
      }),
    )
    expect(insertValues.mock.calls[0]?.[0]).not.toHaveProperty('token')
  })

  it('loads an evicted token from persistence once and then serves the cache', async () => {
    const currentUser = {
      id: 9,
      username: 'cached-user',
      displayName: 'Cached User',
      roles: [{ id: 4, name: '管理员' }],
    }
    const cache = new JwtTokenCache(SECRET)
    const issued = await cache.issue(currentUser)
    cache.clear()

    const select = vi
      .fn()
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              limit: vi.fn().mockResolvedValue([
                {
                  id: currentUser.id,
                  username: currentUser.username,
                  displayName: currentUser.displayName,
                  expiresAt: issued.expiresAt,
                },
              ]),
            })),
          })),
        })),
      })
      .mockReturnValueOnce({
        from: vi.fn(() => ({
          innerJoin: vi.fn(() => ({
            where: vi.fn(() => ({
              orderBy: vi.fn().mockResolvedValue([{ id: 4, name: '管理员' }]),
            })),
          })),
        })),
      })
    const app = {
      authTokens: cache,
      db: { select },
    } as unknown as FastifyInstance
    const request = {
      headers: { authorization: `Bearer ${issued.token}` },
    } as FastifyRequest

    await expect(currentUserFromRequest(app, request)).resolves.toEqual(currentUser)
    expect(select).toHaveBeenCalledTimes(2)

    await expect(currentUserFromRequest(app, request)).resolves.toEqual(currentUser)
    expect(select).toHaveBeenCalledTimes(2)
  })
})
