import { describe, expect, it } from 'vitest'
import { JwtService } from '@nestjs/jwt'
import type { CurrentUser, EntityId } from '@cyber-ai-forge/api-contract'
import { JwtTokenCache } from '@/modules/system/auth/auth-token-cache.js'

const SECRET = 'test-only-jwt-secret-at-least-32-characters'

function cache(options = {}) {
  return new JwtTokenCache(new JwtService({ secret: SECRET }), options)
}

function decodePayload(token: string): Record<string, unknown> {
  const payload = token.split('.')[1]
  if (!payload) {
    throw new Error('JWT payload is missing')
  }
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>
}

function entityId(id: number): EntityId {
  return `0198f31a-0000-7000-8000-${id.toString().padStart(12, '0')}`
}

const roleId = entityId(1)

function user(sequence: number): CurrentUser {
  const id = entityId(sequence)
  return {
    id,
    username: `user-${sequence}`,
    displayName: `User ${sequence}`,
    roles: [{ id: roleId, name: '用户' }],
  }
}

// 覆盖 JWT 验签、LRU 容量、过期/撤销，以及缓存失效与持久会话撤销的职责差异。
describe('JWT LRU token cache', () => {
  it('issues tokens for the Cyber AI Forge issuer and API audience', async () => {
    const tokenCache = cache()
    const issued = await tokenCache.issue(user(1))

    expect(decodePayload(issued.token)).toMatchObject({
      aud: 'cyber-ai-forge-api',
      iss: 'cyber-ai-forge',
      sub: entityId(1),
    })
  })

  it('limits the default cache to 100 entries without invalidating evicted tokens', async () => {
    const tokenCache = cache()
    const tokens: string[] = []
    const persisted = new Map<EntityId, { user: CurrentUser; expiresAt: number }>()
    for (let id = 1; id <= 101; id += 1) {
      const issued = await tokenCache.issue(user(id))
      tokens.push(issued.token)
      persisted.set(entityId(id), {
        user: user(id),
        expiresAt: issued.expiresAt.getTime(),
      })
    }

    expect(tokenCache.size).toBe(100)
    await expect(
      tokenCache.resolve(tokens[0], async ({ subject }) => persisted.get(subject) ?? null),
    ).resolves.toEqual(user(1))
    expect(tokenCache.size).toBe(100)
    await expect(tokenCache.resolve(tokens[100], async () => null)).resolves.toEqual(user(101))
  })

  it('evicts the least recently used token when capacity is reached', async () => {
    const tokenCache = cache({ capacity: 2 })
    const first = await tokenCache.issue(user(1))
    const second = await tokenCache.issue(user(2))

    await expect(tokenCache.resolve(first.token, async () => null)).resolves.toEqual(user(1))
    const third = await tokenCache.issue(user(3))

    expect(tokenCache.size).toBe(2)
    await expect(
      tokenCache.resolve(second.token, async () => ({
        user: user(2),
        expiresAt: second.expiresAt.getTime(),
      })),
    ).resolves.toEqual(user(2))
    await expect(tokenCache.resolve(third.token, async () => null)).resolves.toEqual(user(3))
  })

  it('rejects tampered, expired, and explicitly revoked tokens', async () => {
    let now = Date.UTC(2026, 6, 28, 0, 0, 0)
    const tokenCache = cache({
      ttlMs: 1_000,
      now: () => now,
    })
    const issued = await tokenCache.issue(user(1))
    const tokenParts = issued.token.split('.')
    const signature = tokenParts[2]
    const tamperIndex = Math.floor(signature.length / 2)
    tokenParts[2] = `${signature.slice(0, tamperIndex)}${
      signature[tamperIndex] === 'a' ? 'b' : 'a'
    }${signature.slice(tamperIndex + 1)}`
    const tampered = tokenParts.join('.')

    await expect(
      tokenCache.resolve(tampered, async () => ({
        user: user(1),
        expiresAt: issued.expiresAt.getTime(),
      })),
    ).resolves.toBeNull()
    await expect(tokenCache.resolve(issued.token, async () => null)).resolves.toEqual(user(1))
    now += 1_001
    await expect(
      tokenCache.resolve(issued.token, async () => ({
        user: user(1),
        expiresAt: issued.expiresAt.getTime(),
      })),
    ).resolves.toBeNull()

    const replacement = await tokenCache.issue(user(1))
    await expect(tokenCache.revoke(replacement.token)).resolves.toBe(true)
    await expect(tokenCache.resolve(replacement.token, async () => null)).resolves.toBeNull()
  })

  it('invalidates cached user snapshots without revoking persisted sessions', async () => {
    const tokenCache = cache()
    const first = await tokenCache.issue(user(1))
    const second = await tokenCache.issue(user(1))
    const other = await tokenCache.issue(user(2))

    expect(tokenCache.invalidateUser(entityId(1))).toBe(2)
    await expect(
      tokenCache.resolve(first.token, async () => ({
        user: user(1),
        expiresAt: first.expiresAt.getTime(),
      })),
    ).resolves.toEqual(user(1))
    await expect(tokenCache.resolve(second.token, async () => null)).resolves.toBeNull()
    await expect(tokenCache.resolve(other.token, async () => null)).resolves.toEqual(user(2))
  })
})
