import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common'
import {
  EmptyResultSchema,
  IdParamsSchema,
  MutationResultSchema,
  PositionListQuerySchema,
  PositionOptionListResultSchema,
  PositionPageResultSchema,
  PositionRequestSchema,
  type CurrentUser,
  type IdParams,
  type PositionListQuery,
  type PositionRequest,
} from '@scaffold/api-contract'
import {
  CurrentAccessUser,
  RequirePermissions,
} from '@/modules/system/authorization/authorization.guard.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { ensureUpdated, isUniqueViolation, mutationResult } from '@/shared/http/route-helpers.js'
import { failure, paginatedSuccess, success } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import {
  canChangePositionDepartment,
  canUseDepartment,
  createPosition,
  hasActivePositionAssignments,
  listPositionOptions,
  listPositions,
  positionExists,
  softDeletePosition,
  updatePosition,
} from './positions.service.js'

function normalizePositionListQuery(query: PositionListQuery) {
  return {
    pageNum: query.pageNum ?? 1,
    pageSize: query.pageSize ?? 10,
    keyword: query.keyword,
    departmentId: query.departmentId,
    enabled: query.enabled === undefined ? undefined : query.enabled === 'true',
  }
}

@Controller()
export class PositionsController {
  constructor(@Inject(BackendRuntime) private readonly runtime: BackendRuntime) {}

  @Get('/admin/positions')
  @RequirePermissions(authorizationPermissionKeys.positionsManage)
  @ContractRoute({
    operationId: 'listPositions',
    tags: ['Positions'],
    query: PositionListQuerySchema,
    response: PositionPageResultSchema,
  })
  async list(@Query(new ZodValidationPipe(PositionListQuerySchema)) query: PositionListQuery) {
    const page = await listPositions(this.runtime, normalizePositionListQuery(query))
    return paginatedSuccess(page.list, page.total)
  }

  @Get('/admin/positions/options')
  @RequirePermissions(
    authorizationPermissionKeys.positionsManage,
    authorizationPermissionKeys.usersManage,
  )
  @ContractRoute({
    operationId: 'listPositionOptions',
    tags: ['Positions'],
    response: PositionOptionListResultSchema,
  })
  async options() {
    return success(await listPositionOptions(this.runtime))
  }

  @Post('/admin/positions')
  @RequirePermissions(authorizationPermissionKeys.positionsManage)
  @ContractRoute({
    operationId: 'createPosition',
    tags: ['Positions'],
    body: PositionRequestSchema,
    response: MutationResultSchema,
  })
  async create(
    @Body(new ZodValidationPipe(PositionRequestSchema)) body: PositionRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (!(await canUseDepartment(this.runtime, body.departmentId))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid department')
    }
    return mutationResult(() => createPosition(this.runtime, body, actor.id))
  }

  @Put('/admin/positions/:id')
  @RequirePermissions(authorizationPermissionKeys.positionsManage)
  @ContractRoute({
    operationId: 'updatePosition',
    tags: ['Positions'],
    params: IdParamsSchema,
    body: PositionRequestSchema,
    response: MutationResultSchema,
  })
  async update(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(PositionRequestSchema)) body: PositionRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (!(await canUseDepartment(this.runtime, body.departmentId))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid department')
    }
    if (!(await positionExists(this.runtime, params.id))) {
      ensureUpdated(false)
    }
    if (!(await canChangePositionDepartment(this.runtime, params.id, body.departmentId))) {
      return failure(ErrorCode.RESOURCE_CONFLICT, 'Position has active user assignments')
    }
    try {
      ensureUpdated(await updatePosition(this.runtime, params.id, body, actor.id))
      return success({ id: params.id })
    } catch (error) {
      if (isUniqueViolation(error)) {
        return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
      }
      throw error
    }
  }

  @Delete('/admin/positions/:id')
  @RequirePermissions(authorizationPermissionKeys.positionsManage)
  @ContractRoute({
    operationId: 'deletePosition',
    tags: ['Positions'],
    params: IdParamsSchema,
    response: EmptyResultSchema,
  })
  async remove(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (await hasActivePositionAssignments(this.runtime, params.id)) {
      return failure(ErrorCode.RESOURCE_CONFLICT, 'Position has active user assignments')
    }
    ensureUpdated(await softDeletePosition(this.runtime, params.id, actor.id))
    return success()
  }
}
