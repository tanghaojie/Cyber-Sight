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
} from '@cyber-ai-forge/api-contract'
import {
  CurrentAccessUser,
  RequirePermissions,
} from '@/foundation/modules/authorization/authorization.guard.js'
import { authorizationPermissionKeys } from '@/foundation/modules/authorization/authorization.resources.js'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'
import { ContractRoute } from '@/foundation/shared/http/contract.js'
import {
  ensureUpdated,
  isUniqueViolation,
  mutationResult,
} from '@/foundation/shared/http/route-helpers.js'
import { failure, paginatedSuccess, success } from '@/foundation/shared/http/response.js'
import { ZodValidationPipe } from '@/foundation/shared/http/zod-validation.pipe.js'
import { PositionsService } from './positions.service.js'

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
  constructor(@Inject(PositionsService) private readonly positions: PositionsService) {}

  @Get('/admin/positions')
  @RequirePermissions(authorizationPermissionKeys.positionsManage)
  @ContractRoute({
    operationId: 'listPositions',
    tags: ['Positions'],
    query: PositionListQuerySchema,
    response: PositionPageResultSchema,
  })
  async list(@Query(new ZodValidationPipe(PositionListQuerySchema)) query: PositionListQuery) {
    const page = await this.positions.listPositions(normalizePositionListQuery(query))
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
    return success(await this.positions.listPositionOptions())
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
    if (!(await this.positions.canUseDepartment(body.departmentId))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid department')
    }
    return mutationResult(() => this.positions.createPosition(body, actor.id))
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
    if (!(await this.positions.canUseDepartment(body.departmentId))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid department')
    }
    if (!(await this.positions.positionExists(params.id))) {
      ensureUpdated(false)
    }
    if (!(await this.positions.canChangePositionDepartment(params.id, body.departmentId))) {
      return failure(ErrorCode.RESOURCE_CONFLICT, 'Position has active user assignments')
    }
    try {
      ensureUpdated(await this.positions.updatePosition(params.id, body, actor.id))
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
    if (await this.positions.hasActivePositionAssignments(params.id)) {
      return failure(ErrorCode.RESOURCE_CONFLICT, 'Position has active user assignments')
    }
    ensureUpdated(await this.positions.softDeletePosition(params.id, actor.id))
    return success()
  }
}
