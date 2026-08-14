import { Inject, Injectable, Optional } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { randomUUID } from 'node:crypto'
import { EntityIdSchema, type CurrentUser, type EntityId } from '@cyber-ai-forge/api-contract'

const DEFAULT_CAPACITY = 100
const DEFAULT_TTL_MS = 7 * 24 * 60 * 60 * 1000
import { JWT_IDENTITY, type JwtIdentity } from '@/foundation/shared/runtime/runtime.module.js'

const DEFAULT_JWT_IDENTITY = Object.freeze({
  audience: 'foundation-api',
  issuer: 'foundation',
})

export const JWT_TOKEN_OPTIONS = Symbol('jwtTokenOptions')

/** 内存项以 JWT jti 为键，保存解析后的用户快照和最终有效期。 */
interface TokenEntry {
  expiresAt: number
  user: CurrentUser
}

export interface VerifiedJwt {
  expiresAt: number
  jti: string
  subject: EntityId
}

export interface LoadedTokenSession {
  expiresAt: number
  user: CurrentUser
}

export interface IssuedJwt {
  expiresAt: Date
  token: string
}

// 缓存未命中时的回源边界：实现必须同时确认持久会话、用户状态和令牌主体仍然一致。
export type TokenSessionLoader = (verified: VerifiedJwt) => Promise<LoadedTokenSession | null>

export interface JwtTokenCacheOptions {
  capacity?: number
  ttlMs?: number
  now?: () => number
}

interface JwtPayload {
  exp?: number
  jti?: string
  sub?: string
}

/**
 * 进程内 LRU 只减少已验证令牌的数据库读取，不是认证的权威来源。
 * 每次解析仍验证 JWT；缓存失效、进程重启或容量淘汰后都可由持久会话回源恢复。
 */
@Injectable()
export class JwtTokenCache {
  private readonly capacity: number
  private readonly entries = new Map<string, TokenEntry>()
  private readonly now: () => number
  private readonly ttlMs: number

  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(JWT_TOKEN_OPTIONS) options: JwtTokenCacheOptions,
    @Optional()
    @Inject(JWT_IDENTITY)
    private readonly identity: JwtIdentity = DEFAULT_JWT_IDENTITY,
  ) {
    this.capacity = options.capacity ?? DEFAULT_CAPACITY
    this.ttlMs = options.ttlMs ?? DEFAULT_TTL_MS
    this.now = options.now ?? Date.now
    if (!Number.isInteger(this.capacity) || this.capacity < 1) {
      throw new Error('JWT token cache capacity must be a positive integer')
    }
    if (!Number.isFinite(this.ttlMs) || this.ttlMs < 1) {
      throw new Error('JWT token TTL must be positive')
    }
  }

  get size(): number {
    return this.entries.size
  }

  async issue(user: CurrentUser): Promise<IssuedJwt> {
    const issuedAt = this.now()
    const expiresAt = issuedAt + this.ttlMs
    const jti = randomUUID()
    const token = await this.jwtService.signAsync(
      {
        exp: Math.floor(expiresAt / 1000),
        iat: Math.floor(issuedAt / 1000),
      },
      {
        algorithm: 'HS256',
        audience: this.identity.audience,
        issuer: this.identity.issuer,
        jwtid: jti,
        subject: user.id,
      },
    )

    // Map 的插入顺序充当 LRU 队列；签发前清理过期项，再限制最大容量。
    this.pruneExpired(issuedAt)
    this.entries.set(jti, { expiresAt, user })
    this.evictLeastRecentlyUsed()
    return { expiresAt: new Date(expiresAt), token }
  }

  async resolve(token: string, loadSession: TokenSessionLoader): Promise<CurrentUser | null> {
    // 无论缓存是否命中都先验证签名、签发方、受众和过期时间，缓存不能绕过 JWT 校验。
    const verified = await this.verify(token)
    if (!verified) {
      return null
    }

    const entry = this.entries.get(verified.jti)
    if (entry) {
      if (entry.expiresAt <= this.now() || entry.user.id !== verified.subject) {
        this.entries.delete(verified.jti)
        return null
      }

      // 删除再插入可把命中项移动到 Map 末尾，使其成为最近使用项。
      this.entries.delete(verified.jti)
      this.entries.set(verified.jti, entry)
      return entry.user
    }

    const loaded = await loadSession(verified)
    if (!loaded || loaded.expiresAt <= this.now() || loaded.user.id !== verified.subject) {
      return null
    }

    this.entries.set(verified.jti, {
      // 数据库会话和 JWT 任一先过期都应立即失效。
      expiresAt: Math.min(loaded.expiresAt, verified.expiresAt),
      user: loaded.user,
    })
    this.evictLeastRecentlyUsed()
    return loaded.user
  }

  async revoke(token: string): Promise<boolean> {
    // 持久会话撤销由服务层负责，此处只管理当前进程的热缓存。
    const verified = await this.verify(token)
    return verified ? this.entries.delete(verified.jti) : false
  }

  invalidateUser(userId: EntityId): number {
    // 用户资料、角色或状态改变时调用；只清理本实例，下一次请求会重新读取持久会话快照。
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

  private async verify(token: string): Promise<VerifiedJwt | null> {
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>(token, {
        algorithms: ['HS256'],
        audience: this.identity.audience,
        clockTimestamp: Math.floor(this.now() / 1000),
        issuer: this.identity.issuer,
      })
      const subject = EntityIdSchema.safeParse(payload.sub)
      if (!payload.jti || !subject.success || typeof payload.exp !== 'number') {
        return null
      }
      return {
        expiresAt: payload.exp * 1000,
        jti: payload.jti,
        subject: subject.data,
      }
    } catch {
      // 外部令牌错误是正常认证失败，不把 jsonwebtoken 的细节暴露给路由层。
      return null
    }
  }
}
