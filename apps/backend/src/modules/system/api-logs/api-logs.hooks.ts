import type { CurrentUser } from '@cyber-ai-forge/api-contract'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import { ApiLogsRepository } from './api-logs.repository.js'
import { ApiLogWriter } from './api-logs.service.js'

const ninetyDaysMs = 90 * 24 * 60 * 60 * 1_000
const unmatchedRoutePattern = '__unmatched__'

interface ApiLogRequestContext {
  startedAt: number
  businessStatus: number | null
  loginUsername: string | null
  actor: Pick<CurrentUser, 'id' | 'username'> | null
}

interface AuditedRequest extends FastifyRequest {
  accessUser?: CurrentUser
  apiLogContext?: ApiLogRequestContext
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function requestPath(request: FastifyRequest): string {
  return request.url.split('?')[0] ?? request.url
}

function isExcludedPath(path: string): boolean {
  return path === '/health' || path === '/docs' || path.startsWith('/docs/')
}

function captureLoginActor(request: AuditedRequest, payload: Record<string, unknown>): void {
  if (requestPath(request) !== '/auth/login' || payload.status !== 0 || !isObject(payload.data)) {
    return
  }
  const user = payload.data.user
  if (isObject(user) && typeof user.id === 'number' && typeof user.username === 'string') {
    request.apiLogContext!.actor = { id: user.id, username: user.username }
  }
}

export function createApiLogWriter(
  app: FastifyInstance,
  repository: ApiLogsRepository,
): ApiLogWriter {
  return new ApiLogWriter(
    {
      insert: (events) => repository.insertApiLogEvents(events),
      deleteExpired: (batchSize) => repository.deleteExpiredApiLogs(batchSize),
    },
    app.log,
  )
}

/**
 * Nest 负责路由、鉴权和响应契约；Fastify adapter 的生命周期钩子只负责低开销审计采集。
 */
export function registerApiLogHooks(app: FastifyInstance, writer: ApiLogWriter): void {
  app.addHook('onRequest', async (request) => {
    const audited = request as AuditedRequest
    audited.apiLogContext = {
      startedAt: Date.now(),
      businessStatus: null,
      loginUsername: null,
      actor: null,
    }
  })

  app.addHook('preValidation', async (request) => {
    const audited = request as AuditedRequest
    if (requestPath(request) !== '/auth/login' || !isObject(request.body)) {
      return
    }
    const username = request.body.username
    if (typeof username === 'string') {
      audited.apiLogContext!.loginUsername = username.trim().slice(0, 50) || null
    }
  })

  app.addHook('preSerialization', async (request, _reply, payload) => {
    if (!isObject(payload) || !Number.isInteger(payload.status)) {
      return payload
    }
    const audited = request as AuditedRequest
    audited.apiLogContext!.businessStatus = payload.status as number
    captureLoginActor(audited, payload)
    return payload
  })

  app.addHook('onResponse', async (request, reply) => {
    const audited = request as AuditedRequest
    const context = audited.apiLogContext
    const path = requestPath(request)
    if (!context || isExcludedPath(path)) {
      return
    }

    const routePattern = request.routeOptions.url
    const matchedBusinessRoute =
      typeof routePattern === 'string' && routePattern !== '*' && routePattern !== '/*'
    if (!matchedBusinessRoute && reply.statusCode !== 404) {
      return
    }

    const occurredAt = new Date()
    const actor = audited.accessUser ?? context.actor
    const permanent = path === '/auth/login'
    writer.enqueue({
      occurredAt,
      expiresAt: permanent ? null : new Date(occurredAt.getTime() + ninetyDaysMs),
      requestId: request.id,
      actorUserId: actor?.id ?? null,
      actorUsername: actor?.username ?? context.loginUsername,
      method: request.method,
      routePattern: matchedBusinessRoute ? routePattern : unmatchedRoutePattern,
      httpStatus: reply.statusCode,
      businessStatus: context.businessStatus,
      durationMs: Math.max(0, occurredAt.getTime() - context.startedAt),
    })
  })

  app.addHook('onListen', async () => writer.start())
  app.addHook('onClose', async () => writer.stop())
}
