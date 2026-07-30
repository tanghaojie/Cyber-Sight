import { describe, expect, it } from 'vitest'
import type { CurrentUser } from '@scaffold/api-contract'
import { JwtTokenCache } from '@/modules/system/auth/auth-token-cache.js'

const SECRET = 'test-only-jwt-secret-at-least-32-characters'

function user(id: number): CurrentUser {
  return {
    id,
    username: `user-${id}`,
    displayName: `User ${id}`,
    roles: ['USER'],
  }
}

// 覆盖 JWT 验签、LRU 容量、过期/撤销，以及缓存失效与持久会话撤销的职责差异。
describe('JWT LRU token cache', () => {
  it('limits the default cache to 100 entries without invalidating evicted tokens', async () => {
    const cache = new JwtTokenCache(SECRET)
    const tokens: string[] = []
    const persisted = new Map<number, { user: CurrentUser; expiresAt: number }>()
    for (let id = 1; id <= 101; id += 1) {
      const issued = await cache.issue(user(id))
      tokens.push(issued.token)
      persisted.set(id, {
        user: user(id),
        expiresAt: issued.expiresAt.getTime(),
      })
    }

    expect(cache.size).toBe(100)
    await expect(
      cache.resolve(tokens[0], async ({ subject }) => persisted.get(Number(subject)) ?? null),
    ).resolves.toEqual(user(1))
    expect(cache.size).toBe(100)
    await expect(cache.resolve(tokens[100], async () => null)).resolves.toEqual(user(101))
  })

  it('evicts the least recently used token when capacity is reached', async () => {
    const cache = new JwtTokenCache(SECRET, { capacity: 2 })
    const first = await cache.issue(user(1))
    const second = await cache.issue(user(2))

    await expect(cache.resolve(first.token, async () => null)).resolves.toEqual(user(1))
    const third = await cache.issue(user(3))

    expect(cache.size).toBe(2)
    await expect(
      cache.resolve(second.token, async () => ({
        user: user(2),
        expiresAt: second.expiresAt.getTime(),
      })),
    ).resolves.toEqual(user(2))
    await expect(cache.resolve(third.token, async () => null)).resolves.toEqual(user(3))
  })

  it('rejects tampered, expired, and explicitly revoked tokens', async () => {
    let now = Date.UTC(2026, 6, 28, 0, 0, 0)
    const cache = new JwtTokenCache(SECRET, {
      ttlMs: 1_000,
      now: () => now,
    })
    const issued = await cache.issue(user(1))
    const tokenParts = issued.token.split('.')
    const signature = tokenParts[2]
    const tamperIndex = Math.floor(signature.length / 2)
    tokenParts[2] = `${signature.slice(0, tamperIndex)}${
      signature[tamperIndex] === 'a' ? 'b' : 'a'
    }${signature.slice(tamperIndex + 1)}`
    const tampered = tokenParts.join('.')

    await expect(
      cache.resolve(tampered, async () => ({
        user: user(1),
        expiresAt: issued.expiresAt.getTime(),
      })),
    ).resolves.toBeNull()
    await expect(cache.resolve(issued.token, async () => null)).resolves.toEqual(user(1))
    now += 1_001
    await expect(
      cache.resolve(issued.token, async () => ({
        user: user(1),
        expiresAt: issued.expiresAt.getTime(),
      })),
    ).resolves.toBeNull()

    const replacement = await cache.issue(user(1))
    await expect(cache.revoke(replacement.token)).resolves.toBe(true)
    await expect(cache.resolve(replacement.token, async () => null)).resolves.toBeNull()
  })

  it('invalidates cached user snapshots without revoking persisted sessions', async () => {
    const cache = new JwtTokenCache(SECRET)
    const first = await cache.issue(user(1))
    const second = await cache.issue(user(1))
    const other = await cache.issue(user(2))

    expect(cache.invalidateUser(1)).toBe(2)
    await expect(
      cache.resolve(first.token, async () => ({
        user: user(1),
        expiresAt: first.expiresAt.getTime(),
      })),
    ).resolves.toEqual(user(1))
    await expect(cache.resolve(second.token, async () => null)).resolves.toBeNull()
    await expect(cache.resolve(other.token, async () => null)).resolves.toEqual(user(2))
  })
})
