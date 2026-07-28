import { describe, expect, it } from 'vitest'
import type { CurrentUser } from '@scaffold/api-contract'
import { JwtTokenCache } from '../src/modules/auth/auth-token-cache.js'

const SECRET = 'test-only-jwt-secret-at-least-32-characters'

function user(id: number): CurrentUser {
  return {
    id,
    username: `user-${id}`,
    displayName: `User ${id}`,
    roles: ['USER'],
  }
}

describe('JWT LRU token cache', () => {
  it('limits the default cache to 100 active tokens', async () => {
    const cache = new JwtTokenCache(SECRET)
    const tokens: string[] = []
    for (let id = 1; id <= 101; id += 1) {
      tokens.push(await cache.issue(user(id)))
    }

    expect(cache.size).toBe(100)
    await expect(cache.resolve(tokens[0])).resolves.toBeNull()
    await expect(cache.resolve(tokens[100])).resolves.toEqual(user(101))
  })

  it('evicts the least recently used token when capacity is reached', async () => {
    const cache = new JwtTokenCache(SECRET, { capacity: 2 })
    const first = await cache.issue(user(1))
    const second = await cache.issue(user(2))

    await expect(cache.resolve(first)).resolves.toEqual(user(1))
    const third = await cache.issue(user(3))

    expect(cache.size).toBe(2)
    await expect(cache.resolve(second)).resolves.toBeNull()
    await expect(cache.resolve(first)).resolves.toEqual(user(1))
    await expect(cache.resolve(third)).resolves.toEqual(user(3))
  })

  it('rejects tampered, expired, and explicitly revoked tokens', async () => {
    let now = Date.UTC(2026, 6, 28, 0, 0, 0)
    const cache = new JwtTokenCache(SECRET, {
      ttlMs: 1_000,
      now: () => now,
    })
    const token = await cache.issue(user(1))
    const tampered = `${token.slice(0, -1)}${token.endsWith('a') ? 'b' : 'a'}`

    await expect(cache.resolve(tampered)).resolves.toBeNull()
    await expect(cache.resolve(token)).resolves.toEqual(user(1))
    now += 1_001
    await expect(cache.resolve(token)).resolves.toBeNull()

    const replacement = await cache.issue(user(1))
    await expect(cache.revoke(replacement)).resolves.toBe(true)
    await expect(cache.resolve(replacement)).resolves.toBeNull()
  })

  it('revokes all tokens for one user without affecting other users', async () => {
    const cache = new JwtTokenCache(SECRET)
    const first = await cache.issue(user(1))
    const second = await cache.issue(user(1))
    const other = await cache.issue(user(2))

    expect(cache.revokeUser(1)).toBe(2)
    await expect(cache.resolve(first)).resolves.toBeNull()
    await expect(cache.resolve(second)).resolves.toBeNull()
    await expect(cache.resolve(other)).resolves.toEqual(user(2))
  })
})
