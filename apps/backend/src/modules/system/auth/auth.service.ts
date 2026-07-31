import { and, eq, gt } from 'drizzle-orm'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { CurrentUser, LoginData } from '@scaffold/api-contract'
import { authSessions, roles, userRoles, users } from '@/db/schema.js'
import type { LoadedTokenSession, VerifiedJwt } from './auth-token-cache.js'
import { hashSessionToken, verifyPassword } from './auth.security.js'

/** 只接受标准的单个 Bearer Token，不容忍额外空白或其他认证方案。 */
function bearerToken(request: FastifyRequest): string | null {
  const authorization = request.headers.authorization
  if (!authorization) {
    return null
  }
  const match = /^Bearer ([^\s]+)$/i.exec(authorization)
  return match?.[1] ?? null
}

async function rolesForUser(app: FastifyInstance, userId: number): Promise<CurrentUser['roles']> {
  // 会话身份只包含仍有效角色，禁用/软删除角色不会继续影响授权判定。
  const rows = await app.db
    .select({ id: roles.id, name: roles.name })
    .from(userRoles)
    .innerJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
    .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))
    .orderBy(roles.id)

  return rows
}

async function loadPersistedSession(
  app: FastifyInstance,
  token: string,
  verified: VerifiedJwt,
): Promise<LoadedTokenSession | null> {
  const userId = Number(verified.subject)
  if (!Number.isSafeInteger(userId) || userId < 1) {
    return null
  }

  const [row] = await app.db
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
      roles: await rolesForUser(app, row.id),
    },
  }
}

export async function authenticateCredentials(
  app: FastifyInstance,
  username: string,
  password: string,
): Promise<LoginData | null> {
  const [user] = await app.db
    .select()
    .from(users)
    .where(and(eq(users.username, username), eq(users.enabled, true), eq(users.isDeleted, false)))
    .limit(1)

  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    return null
  }

  const now = new Date()
  await app.db
    .update(users)
    .set({ lastLoginAt: now, updatedAt: now, updatedBy: user.id })
    .where(eq(users.id, user.id))

  const currentUser = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    roles: await rolesForUser(app, user.id),
  }
  const issued = await app.authTokens.issue(currentUser)
  try {
    // 内存签发成功后必须落库，服务重启后才能恢复会话并支持持久撤销。
    await app.db.insert(authSessions).values({
      userId: user.id,
      tokenHash: hashSessionToken(issued.token),
      expiresAt: issued.expiresAt,
      createdBy: user.id,
      updatedBy: user.id,
    })
  } catch (error) {
    // 落库失败时撤销刚写入的缓存，避免产生仅当前进程承认的半成功会话。
    await app.authTokens.revoke(issued.token)
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

export async function currentUserFromRequest(
  app: FastifyInstance,
  request: FastifyRequest,
): Promise<CurrentUser | null> {
  const token = bearerToken(request)
  if (!token) {
    return null
  }

  return app.authTokens.resolve(token, function loadSession(verified) {
    // 缓存未命中时以令牌摘要查询持久会话，而不是仅凭有效 JWT 恢复身份。
    return loadPersistedSession(app, token, verified)
  })
}

export async function requireCurrentUser(
  app: FastifyInstance,
  request: FastifyRequest,
): Promise<CurrentUser> {
  const user = await currentUserFromRequest(app, request)
  if (!user) {
    throw app.httpErrors.unauthorized('Authentication required')
  }
  return user
}

export async function revokeCurrentToken(
  app: FastifyInstance,
  request: FastifyRequest,
  actorId: number,
): Promise<void> {
  const token = bearerToken(request)
  if (token) {
    // 先软删除持久会话，再清理本进程缓存，确保重启和其他实例也不能恢复该令牌。
    await app.db
      .update(authSessions)
      .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
      .where(
        and(eq(authSessions.tokenHash, hashSessionToken(token)), eq(authSessions.isDeleted, false)),
      )
    await app.authTokens.revoke(token)
  }
}

export function invalidateUserTokenCache(app: FastifyInstance, userId: number): number {
  return app.authTokens.invalidateUser(userId)
}

export async function revokeUserTokens(
  app: FastifyInstance,
  userId: number,
  actorId: number,
): Promise<void> {
  // 用户禁用、删除或权限敏感变更时，同时撤销全部持久会话和内存快照。
  app.authTokens.invalidateUser(userId)
  await app.db
    .update(authSessions)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(authSessions.userId, userId), eq(authSessions.isDeleted, false)))
}

export function invalidateAllTokenCache(app: FastifyInstance): void {
  app.authTokens.clear()
}
