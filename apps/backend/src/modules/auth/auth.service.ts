import { and, eq, gt } from 'drizzle-orm'
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'
import type { components } from '@scaffold/openapi-spec'
import { authSessions, roles, userRoles, users } from '../../db/schema.js'
import {
  createSessionToken,
  hashSessionToken,
  verifyPassword,
} from './auth.security.js'

export type CurrentUser = components['schemas']['CurrentUser']

const SESSION_COOKIE = 'scaffold_session'
const SESSION_TTL_MS = 8 * 60 * 60 * 1000

function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) {
    return null
  }

  for (const part of header.split(';')) {
    const [cookieName, ...valueParts] = part.trim().split('=')
    if (cookieName === name) {
      return decodeURIComponent(valueParts.join('='))
    }
  }

  return null
}

function sessionCookie(token: string, maxAge: number): string {
  const value = token ? encodeURIComponent(token) : ''
  return `${SESSION_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
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
  password: string,
  reply: FastifyReply
): Promise<CurrentUser | null> {
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

  const token = createSessionToken()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS)

  await app.db.insert(authSessions).values({
    userId: user.id,
    tokenHash: hashSessionToken(token),
    expiresAt,
    createdBy: user.id,
    updatedBy: user.id,
  })
  await app.db
    .update(users)
    .set({ lastLoginAt: now, updatedAt: now, updatedBy: user.id })
    .where(eq(users.id, user.id))

  reply.header('set-cookie', sessionCookie(token, SESSION_TTL_MS / 1000))
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    roles: await rolesForUser(app, user.id),
  }
}

export async function currentUserFromRequest(
  app: FastifyInstance,
  request: FastifyRequest
): Promise<CurrentUser | null> {
  const token = parseCookie(request.headers.cookie, SESSION_COOKIE)
  if (!token) {
    return null
  }

  const [row] = await app.db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
    })
    .from(authSessions)
    .innerJoin(
      users,
      and(
        eq(authSessions.userId, users.id),
        eq(users.enabled, true),
        eq(users.isDeleted, false)
      )
    )
    .where(
      and(
        eq(authSessions.tokenHash, hashSessionToken(token)),
        eq(authSessions.isDeleted, false),
        gt(authSessions.expiresAt, new Date())
      )
    )
    .limit(1)

  if (!row) {
    return null
  }

  return { ...row, roles: await rolesForUser(app, row.id) }
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

export async function revokeCurrentSession(
  app: FastifyInstance,
  request: FastifyRequest,
  reply: FastifyReply,
  actorId: number
): Promise<void> {
  const token = parseCookie(request.headers.cookie, SESSION_COOKIE)
  if (token) {
    await app.db
      .update(authSessions)
      .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
      .where(
        and(
          eq(authSessions.tokenHash, hashSessionToken(token)),
          eq(authSessions.isDeleted, false)
        )
      )
  }
  reply.header('set-cookie', sessionCookie('', 0))
}
