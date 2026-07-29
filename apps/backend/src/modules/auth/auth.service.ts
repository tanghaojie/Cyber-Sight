import { and, eq, gt } from 'drizzle-orm'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { CurrentUser, LoginData } from '@scaffold/api-contract'
import { authSessions, roles, userRoles, users } from '@/db/schema.js'
import type { LoadedTokenSession, VerifiedJwt } from './auth-token-cache.js'
import { hashSessionToken, verifyPassword } from './auth.security.js'

function bearerToken(request: FastifyRequest): string | null {
  const authorization = request.headers.authorization
  if (!authorization) {
    return null
  }
  const match = /^Bearer ([^\s]+)$/i.exec(authorization)
  return match?.[1] ?? null
}

async function rolesForUser(app: FastifyInstance, userId: number): Promise<string[]> {
  const rows = await app.db
    .select({ code: roles.code })
    .from(userRoles)
    .innerJoin(roles, and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false)))
    .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))

  return rows.map((row) => row.code)
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
    await app.db.insert(authSessions).values({
      userId: user.id,
      tokenHash: hashSessionToken(issued.token),
      expiresAt: issued.expiresAt,
      createdBy: user.id,
      updatedBy: user.id,
    })
  } catch (error) {
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
  app.authTokens.invalidateUser(userId)
  await app.db
    .update(authSessions)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(authSessions.userId, userId), eq(authSessions.isDeleted, false)))
}

export function invalidateAllTokenCache(app: FastifyInstance): void {
  app.authTokens.clear()
}
