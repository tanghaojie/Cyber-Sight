import type { FastifyInstance } from 'fastify'
import {
  ApiLogPageResultSchema,
  ApiLogQuerySchema,
  ErrorResponseSchema,
  toFastifySchema,
  type ApiLogQuery,
} from '@scaffold/api-contract'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { paginatedSuccess } from '@/shared/http/response.js'
import { listApiLogs, type NormalizedApiLogQuery } from './api-logs.repository.js'

function normalizedApiLogQuery(query: ApiLogQuery): NormalizedApiLogQuery {
  return {
    pageNum: query.pageNum ?? 1,
    pageSize: query.pageSize ?? 10,
    actorUserId: query.actorUserId,
    actorUsername: query.actorUsername,
    method: query.method,
    routePattern: query.routePattern,
    httpStatus: query.httpStatus,
    retention: query.retention,
    occurredFrom: query.occurredFrom === undefined ? undefined : new Date(query.occurredFrom),
    occurredTo: query.occurredTo === undefined ? undefined : new Date(query.occurredTo),
  }
}

/** 管理员仅可查询脱敏后的接口日志元数据，日志本身没有编辑或手工删除入口。 */
export async function apiLogRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ApiLogQuery }>(
    '/admin/api-logs',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.apiLogsRead] },
      },
      schema: {
        operationId: 'listApiLogs',
        tags: ['API logs'],
        querystring: toFastifySchema(ApiLogQuerySchema),
        response: {
          200: toFastifySchema(ApiLogPageResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listApiLogHandler(request) {
      const result = await listApiLogs(app, normalizedApiLogQuery(request.query))
      return paginatedSuccess(result.list, result.total)
    },
  )
}
