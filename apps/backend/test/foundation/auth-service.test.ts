import { describe, expect, it, vi } from 'vitest'
import { JwtService } from '@nestjs/jwt'
import { AuthService } from '@/foundation/modules/auth/auth.service.js'
import { JwtTokenCache } from '@/foundation/modules/auth/auth-token-cache.js'
import { hashPassword, hashSessionToken } from '@/foundation/modules/auth/auth.security.js'

const SECRET = 'test-only-jwt-secret-at-least-32-characters'
const operatorId = '0198f31a-0000-7000-8000-000000000007'
const cachedUserId = '0198f31a-0000-7000-8000-000000000009'
const userRoleId = '0198f31a-0000-7000-8000-000000000003'
const adminRoleId = '0198f31a-0000-7000-8000-000000000004'

function tokenCache() {
  return new JwtTokenCache(new JwtService({ secret: SECRET }), {})
}

// 验证登录签发必须落库，内存淘汰后仍可从有效持久会话恢复且只恢复一次。
describe('authentication service persistence cache', () => {
  it('persists a one-way token hash when credentials are authenticated', async () => {
    const password = 'StrongPassword!123'
    const userRow = {
      id: operatorId,
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
            where: vi.fn(() => ({
              orderBy: vi.fn().mockResolvedValue([{ id: userRoleId, name: '用户' }]),
            })),
          })),
        })),
      })
    const insertValues = vi.fn().mockResolvedValue([])
    const db = {
      insert: vi.fn(() => ({ values: insertValues })),
      select,
      update: vi.fn(() => ({
        set: vi.fn(() => ({ where: vi.fn().mockResolvedValue([]) })),
      })),
    }
    const service = new AuthService(db as never, tokenCache())

    const result = await service.authenticateCredentials(userRow.username, password)

    expect(result?.user).toEqual({
      id: operatorId,
      username: 'operator',
      displayName: 'Operator',
      roles: [{ id: userRoleId, name: '用户' }],
    })
    expect(result?.issued?.token).toEqual(expect.any(String))
    expect(insertValues).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: operatorId,
        tokenHash: hashSessionToken(result?.issued?.token ?? ''),
        expiresAt: expect.any(Date),
      }),
    )
    expect(insertValues.mock.calls[0]?.[0]).not.toHaveProperty('token')
  })

  it('loads an evicted token from persistence once and then serves the cache', async () => {
    const currentUser = {
      id: cachedUserId,
      username: 'cached-user',
      displayName: 'Cached User',
      roles: [{ id: adminRoleId, name: '管理员' }],
    }
    const cache = tokenCache()
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
              orderBy: vi.fn().mockResolvedValue([{ id: adminRoleId, name: '管理员' }]),
            })),
          })),
        })),
      })
    const service = new AuthService({ select } as never, cache)
    const authorization = `Bearer ${issued.token}`

    await expect(service.currentUserFromAuthorization(authorization)).resolves.toEqual(currentUser)
    expect(select).toHaveBeenCalledTimes(2)

    await expect(service.currentUserFromAuthorization(authorization)).resolves.toEqual(currentUser)
    expect(select).toHaveBeenCalledTimes(2)
  })
})
