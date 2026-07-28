import { and, eq } from 'drizzle-orm'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import type { CurrentUser, LoginData } from '@scaffold/api-contract'
import { roles, userRoles, users } from '../../db/schema.js'
import { verifyPassword } from './auth.security.js'

function bearerToken(request: FastifyRequest): string | null {
  const authorization = request.headers.authorization
  if (!authorization) {
    return null
  }
  const match = /^Bearer ([^\s]+)$/i.exec(authorization)
  return match?.[1] ?? null
}

async function rolesForUser(
  app: FastifyInstance,
  userId: number
): Promise<string[]> {
  const rows = await app.db
    .select({ code: roles.code })
    .from(userRoles)
    .innerJoin(
      roles,
      and(eq(userRoles.roleId, roles.id), eq(roles.isDeleted, false))
    )
    .where(
      and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false))
    )

  return rows.map((row) => row.code)
}

export async function authenticateCredentials(
  app: FastifyInstance,
  username: string,
  password: string
): Promise<LoginData | null> {
  const [user] = await app.db
    .select()
    .from(users)
    .where(
      and(
        eq(users.username, username),
        eq(users.enabled, true),
        eq(users.isDeleted, false)
      )
    )
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
  return {
    user: currentUser,
    token: await app.authTokens.issue(currentUser),
  }
}

export async function currentUserFromRequest(
  app: FastifyInstance,
  request: FastifyRequest
): Promise<CurrentUser | null> {
  const token = bearerToken(request)
  if (!token) {
    return null
  }

  return app.authTokens.resolve(token)
}

export async function requireCurrentUser(
  app: FastifyInstance,
  request: FastifyRequest
): Promise<CurrentUser> {
  const user = await currentUserFromRequest(app, request)
  if (!user) {
    throw app.httpErrors.unauthorized('Authentication required')
  }
  return user
}

export async function revokeCurrentToken(
  app: FastifyInstance,
  request: FastifyRequest
): Promise<void> {
  const token = bearerToken(request)
  if (token) {
    await app.authTokens.revoke(token)
  }
}

export function revokeUserTokens(app: FastifyInstance, userId: number): number {
  return app.authTokens.revokeUser(userId)
}

export function revokeAllTokens(app: FastifyInstance): void {
  app.authTokens.clear()
}
