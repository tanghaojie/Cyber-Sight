import type { CurrentUser } from '@scaffold/api-contract'
import type { FastifyInstance, FastifyRequest } from 'fastify'
import fp from 'fastify-plugin'
import { deleteExpiredApiLogs, insertApiLogEvents } from './api-logs.repository.js'
import { ApiLogWriter } from './api-logs.service.js'

const ninetyDaysMs = 90 * 24 * 60 * 60 * 1_000
const unmatchedRoutePattern = '__unmatched__'

export interface ApiLogRouteConfig {
  enabled?: boolean
  retention?: 'permanent'
  actor?: 'loginUsername'
}

interface ApiLogRequestContext {
  startedAt: number
  businessStatus: number | null
  loginUsername: string | null
  actor: Pick<CurrentUser, 'id' | 'username'> | null
}

declare module 'fastify' {
  interface FastifyContextConfig {
    apiLog?: ApiLogRouteConfig
  }

  interface FastifyRequest {
    apiLogContext?: ApiLogRequestContext
  }

  interface FastifyInstance {
    apiLogWriter: ApiLogWriter
  }
}

/** 登录是公开路由，认证 Hook 不会写 accessUser，因此由成功处理器补充操作者快照。 */
export function setApiLogActor(
  request: FastifyRequest,
  actor: Pick<CurrentUser, 'id' | 'username'>,
): void {
  if (request.apiLogContext) {
    request.apiLogContext.actor = actor
  }
}

function requestPath(request: FastifyRequest): string {
  return request.url.split('?')[0] ?? request.url
}

function isExcludedPath(path: string): boolean {
  return path === '/health' || path === '/docs' || path.startsWith('/docs/')
}

function hasAuthorizationConfig(request: FastifyRequest): boolean {
  return request.routeOptions.config.authorization !== undefined
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * 在根封装域注册，使 Swagger、健康检查和未匹配路由都可统一分类；基础设施路径在落库前排除。
 */
async function registerApiLogs(app: FastifyInstance): Promise<void> {
  const writer = new ApiLogWriter(
    {
      insert(events) {
        return insertApiLogEvents(app, events)
      },
      deleteExpired(batchSize) {
        return deleteExpiredApiLogs(app, batchSize)
      },
    },
    app.log,
  )
  app.decorate('apiLogWriter', writer)
  app.addHook('onRequest', async function createApiLogContext(request) {
    request.apiLogContext = {
      startedAt: Date.now(),
      businessStatus: null,
      loginUsername: null,
      actor: null,
    }
  })
  app.addHook('preValidation', async function captureLoginUsername(request) {
    const config = request.routeOptions.config.apiLog
    if (config?.actor !== 'loginUsername' || !isObject(request.body)) {
      return
    }
    const username = request.body.username
    if (typeof username === 'string') {
      request.apiLogContext!.loginUsername = username.trim().slice(0, 50) || null
    }
  })
  app.addHook('preSerialization', async function captureBusinessStatus(request, _reply, payload) {
    if (!isObject(payload) || !Number.isInteger(payload.status)) {
      return payload
    }
    request.apiLogContext!.businessStatus = payload.status as number
    return payload
  })
  app.addHook('onResponse', async function enqueueApiLog(request, reply) {
    const context = request.apiLogContext
    if (!context) {
      return
    }
    const path = requestPath(request)
    const config = request.routeOptions.config.apiLog
    if (isExcludedPath(path) || config?.enabled === false) {
      return
    }
    const isBusinessRequest = hasAuthorizationConfig(request)
    if (!isBusinessRequest && reply.statusCode !== 404) {
      return
    }
    const occurredAt = new Date()
    const actor = request.accessUser ?? context.actor
    const permanent = config?.retention === 'permanent'
    writer.enqueue({
      occurredAt,
      expiresAt: permanent ? null : new Date(occurredAt.getTime() + ninetyDaysMs),
      requestId: request.id,
      actorUserId: actor?.id ?? null,
      actorUsername: actor?.username ?? context.loginUsername,
      method: request.method,
      routePattern: isBusinessRequest
        ? (request.routeOptions.url ?? unmatchedRoutePattern)
        : unmatchedRoutePattern,
      httpStatus: reply.statusCode,
      businessStatus: context.businessStatus,
      durationMs: Math.max(0, occurredAt.getTime() - context.startedAt),
    })
  })
  app.addHook('onListen', async function startApiLogWriter() {
    writer.start()
  })
  app.addHook('onClose', async function stopApiLogWriter() {
    await writer.stop()
  })
}

export default fp(registerApiLogs)
