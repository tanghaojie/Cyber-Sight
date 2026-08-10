import { Inject, Injectable } from '@nestjs/common'
import { and, eq, gt } from 'drizzle-orm'
import type { CurrentUser, LoginData } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/db/index.js'
import { authSessions, roles, userRoles, users } from '@/db/schema.js'
import { DATABASE } from '@/shared/database/database.provider.js'
import { unauthorized } from '@/shared/errors/http-errors.js'
import { hashPassword, hashSessionToken, verifyPassword } from './auth.security.js'
import type { LoadedTokenSession, VerifiedJwt } from './auth-token-cache.js'
import { JwtTokenCache } from './auth-token-cache.js'

/** 只接受标准的单个 Bearer Token，不容忍额外空白或其他认证方案。 */
function bearerToken(authorization?: string): string | null {
  if (!authorization) {
    return null
  }
  const match = /^Bearer ([^\s]+)$/i.exec(authorization)
  return match?.[1] ?? null
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(JwtTokenCache)
    private readonly authTokens: JwtTokenCache,
  ) {}

  private async rolesForUser(userId: number): Promise<CurrentUser['roles']> {
    // 会话身份只包含仍有效角色，禁用/软删除角色不会继续影响授权判定。
    const rows = await this.db
      .select({ id: roles.id, name: roles.name })
      .from(userRoles)
      .innerJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
      .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))
      .orderBy(roles.id)

    return rows
  }

  /**
   * 缓存未命中时从数据库恢复身份。有效 JWT 只是必要条件，仍必须匹配未撤销、未过期的 tokenHash 会话。
   */
  private async loadPersistedSession(
    token: string,
    verified: VerifiedJwt,
  ): Promise<LoadedTokenSession | null> {
    const userId = Number(verified.subject)
    if (!Number.isSafeInteger(userId) || userId < 1) {
      return null
    }

    const [row] = await this.db
      .select({
        displayName: users.displayName,
        expiresAt: authSessions.expiresAt,
        id: users.id,
        username: users.username,
      })
      .from(authSessions)
      .innerJoin(
        users,
        and(eq(authSessions.userId, users.id), eq(users.enabled, true), eq(users.isDeleted, false)),
      )
      .where(
        and(
          eq(authSessions.tokenHash, hashSessionToken(token)),
          eq(authSessions.userId, userId),
          eq(authSessions.isDeleted, false),
          gt(authSessions.expiresAt, new Date()),
        ),
      )
      .limit(1)

    // 持久会话、用户状态或有效期任一不满足，都拒绝重新填充内存缓存。
    if (!row) {
      return null
    }

    return {
      expiresAt: row.expiresAt.getTime(),
      user: {
        id: row.id,
        username: row.username,
        displayName: row.displayName,
        roles: await this.rolesForUser(row.id),
      },
    }
  }

  async authenticateCredentials(username: string, password: string): Promise<LoginData | null> {
    const [user] = await this.db
      .select()
      .from(users)
      .where(and(eq(users.username, username), eq(users.enabled, true), eq(users.isDeleted, false)))
      .limit(1)

    // 不区分账号不存在、禁用或密码错误，避免登录接口成为用户名枚举渠道。
    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return null
    }

    const now = new Date()
    await this.db
      .update(users)
      .set({ lastLoginAt: now, updatedAt: now, updatedBy: user.id })
      .where(eq(users.id, user.id))

    const currentUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      roles: await this.rolesForUser(user.id),
    }
    const issued = await this.authTokens.issue(currentUser)
    try {
      // 内存签发成功后必须落库，服务重启后才能恢复会话并支持持久撤销。
      await this.db.insert(authSessions).values({
        userId: user.id,
        tokenHash: hashSessionToken(issued.token),
        expiresAt: issued.expiresAt,
        createdBy: user.id,
        updatedBy: user.id,
      })
    } catch (error) {
      // 落库失败时撤销刚写入的缓存，避免产生仅当前进程承认的半成功会话。
      await this.authTokens.revoke(issued.token)
      throw error
    }

    return {
      user: currentUser,
      issued: {
        token: issued.token,
        expiresAt: issued.expiresAt.toISOString(),
      },
    }
  }

  async currentUserFromAuthorization(authorization?: string): Promise<CurrentUser | null> {
    // 路由层只获得统一的当前用户结果，不接触 Bearer 解析、JWT 校验和持久会话查询细节。
    const token = bearerToken(authorization)
    if (!token) {
      return null
    }

    return this.authTokens.resolve(token, (verified) => this.loadPersistedSession(token, verified))
  }

  async requireCurrentUser(authorization?: string): Promise<CurrentUser> {
    const user = await this.currentUserFromAuthorization(authorization)
    if (!user) {
      throw unauthorized()
    }
    return user
  }

  async revokeCurrentToken(authorization: string | undefined, actorId: number): Promise<void> {
    const token = bearerToken(authorization)
    if (token) {
      // 先软删除持久会话，再清理本进程缓存，确保重启和其他实例也不能恢复该令牌。
      await this.db
        .update(authSessions)
        .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
        .where(
          and(
            eq(authSessions.tokenHash, hashSessionToken(token)),
            eq(authSessions.isDeleted, false),
          ),
        )
      await this.authTokens.revoke(token)
    }
  }

  invalidateUserTokenCache(userId: number): number {
    return this.authTokens.invalidateUser(userId)
  }

  async revokeUserTokens(userId: number, actorId: number): Promise<void> {
    // 用户禁用、删除或权限敏感变更时，同时撤销全部持久会话和内存快照。
    this.authTokens.invalidateUser(userId)
    await this.db
      .update(authSessions)
      .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(authSessions.userId, userId), eq(authSessions.isDeleted, false)))
  }

  invalidateAllTokenCache(): void {
    this.authTokens.clear()
  }
}
