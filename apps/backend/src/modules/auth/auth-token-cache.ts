import { randomUUID } from 'node:crypto'
import type { CurrentUser } from '@scaffold/api-contract'
import { SignJWT, jwtVerify } from 'jose'

const DEFAULT_CAPACITY = 100
const DEFAULT_TTL_MS = 8 * 60 * 60 * 1000
const JWT_AUDIENCE = 'jtlab-api'
const JWT_ISSUER = 'jtlab'

interface TokenEntry {
  expiresAt: number
  user: CurrentUser
}

export interface VerifiedJwt {
  expiresAt: number
  jti: string
  subject: string
}

export interface LoadedTokenSession {
  expiresAt: number
  user: CurrentUser
}

export interface IssuedJwt {
  expiresAt: Date
  token: string
}

type TokenSessionLoader = (
  verified: VerifiedJwt
) => Promise<LoadedTokenSession | null>

interface JwtTokenCacheOptions {
  capacity?: number
  ttlMs?: number
  now?: () => number
}

export class JwtTokenCache {
  private readonly capacity: number
  private readonly entries = new Map<string, TokenEntry>()
  private readonly key: Uint8Array
  private readonly now: () => number
  private readonly ttlMs: number

  constructor(secret: string, options: JwtTokenCacheOptions = {}) {
    if (secret.length < 32) {
      throw new Error('JWT secret must contain at least 32 characters')
    }

    this.capacity = options.capacity ?? DEFAULT_CAPACITY
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
    this.now = options.now ?? Date.now
    if (!Number.isInteger(this.capacity) || this.capacity < 1) {
      throw new Error('JWT token cache capacity must be a positive integer')
    }
    if (!Number.isFinite(this.ttlMs) || this.ttlMs < 1) {
      throw new Error('JWT token TTL must be positive')
    }
    this.key = new TextEncoder().encode(secret)
  }

  get size(): number {
    return this.entries.size
  }

  async issue(user: CurrentUser): Promise<IssuedJwt> {
    const issuedAt = this.now()
    const expiresAt = issuedAt + this.ttlMs
    const jti = randomUUID()
    const token = await new SignJWT({})
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setSubject(String(user.id))
      .setJti(jti)
      .setIssuedAt(Math.floor(issuedAt / 1000))
      .setExpirationTime(Math.floor(expiresAt / 1000))
      .sign(this.key)

    this.pruneExpired(issuedAt)
    this.entries.set(jti, { expiresAt, user })
    this.evictLeastRecentlyUsed()
    return { expiresAt: new Date(expiresAt), token }
  }

  async resolve(
    token: string,
    loadSession: TokenSessionLoader
  ): Promise<CurrentUser | null> {
    const verified = await this.verify(token)
    if (!verified) {
      return null
    }

    const entry = this.entries.get(verified.jti)
    if (entry) {
      if (
        entry.expiresAt <= this.now() ||
        String(entry.user.id) !== verified.subject
      ) {
        this.entries.delete(verified.jti)
        return null
      }

      this.entries.delete(verified.jti)
      this.entries.set(verified.jti, entry)
      return entry.user
    }

    const loaded = await loadSession(verified)
    if (
      !loaded ||
      loaded.expiresAt <= this.now() ||
      String(loaded.user.id) !== verified.subject
    ) {
      return null
    }

    this.entries.set(verified.jti, {
      expiresAt: Math.min(loaded.expiresAt, verified.expiresAt),
      user: loaded.user,
    })
    this.evictLeastRecentlyUsed()
    return loaded.user
  }

  async revoke(token: string): Promise<boolean> {
    const verified = await this.verify(token)
    return verified ? this.entries.delete(verified.jti) : false
  }

  invalidateUser(userId: number): number {
    let invalidated = 0
    for (const [jti, entry] of this.entries) {
      if (entry.user.id === userId) {
        this.entries.delete(jti)
        invalidated += 1
      }
    }
    return invalidated
  }

  clear(): void {
    this.entries.clear()
  }

  private evictLeastRecentlyUsed(): void {
    while (this.entries.size > this.capacity) {
      const oldest = this.entries.keys().next().value
      if (typeof oldest !== 'string') {
        return
      }
      this.entries.delete(oldest)
    }
  }

  private pruneExpired(now: number): void {
    for (const [jti, entry] of this.entries) {
      if (entry.expiresAt <= now) {
        this.entries.delete(jti)
      }
    }
  }

  private async verify(
    token: string
  ): Promise<VerifiedJwt | null> {
    try {
      const { payload } = await jwtVerify(token, this.key, {
        algorithms: ['HS256'],
        audience: JWT_AUDIENCE,
        currentDate: new Date(this.now()),
        issuer: JWT_ISSUER,
      })
      if (!payload.jti || !payload.sub || typeof payload.exp !== 'number') {
        return null
      }
      return {
        expiresAt: payload.exp * 1000,
        jti: payload.jti,
        subject: payload.sub,
      }
    } catch {
      return null
    }
  }
}

declare module 'fastify' {
  interface FastifyInstance {
    authTokens: JwtTokenCache
  }
}
