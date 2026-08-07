import { Controller, Get, Inject, Query } from '@nestjs/common'
import { ApiLogPageResultSchema, ApiLogQuerySchema, type ApiLogQuery } from '@scaffold/api-contract'
import { RequirePermissions } from '@/modules/system/authorization/authorization.guard.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { paginatedSuccess } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
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

@Controller()
export class ApiLogsController {
  constructor(@Inject(BackendRuntime) private readonly runtime: BackendRuntime) {}

  @Get('/admin/api-logs')
  @RequirePermissions(authorizationPermissionKeys.apiLogsRead)
  @ContractRoute({
    operationId: 'listApiLogs',
    tags: ['API logs'],
    query: ApiLogQuerySchema,
    response: ApiLogPageResultSchema,
  })
  async list(@Query(new ZodValidationPipe(ApiLogQuerySchema)) query: ApiLogQuery) {
    const result = await listApiLogs(this.runtime, normalizedApiLogQuery(query))
    return paginatedSuccess(result.list, result.total)
  }
}
