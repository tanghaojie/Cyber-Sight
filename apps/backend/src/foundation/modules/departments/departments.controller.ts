import { Body, Controller, Delete, Get, Inject, Param, Post, Put } from '@nestjs/common'
import {
  DepartmentListResultSchema,
  DepartmentOptionListResultSchema,
  DepartmentRequestSchema,
  EmptyResultSchema,
  IdParamsSchema,
  MutationResultSchema,
  type CurrentUser,
  type DepartmentRequest,
  type IdParams,
} from '@cyber-ai-forge/api-contract'
import {
  CurrentAccessUser,
  RequirePermissions,
} from '@/foundation/modules/authorization/authorization.guard.js'
import { authorizationPermissionKeys } from '@/foundation/modules/authorization/authorization.resources.js'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'
import { ContractRoute } from '@/foundation/shared/http/contract.js'
import { ensureUpdated, mutationResult } from '@/foundation/shared/http/route-helpers.js'
import { failure, success } from '@/foundation/shared/http/response.js'
import { ZodValidationPipe } from '@/foundation/shared/http/zod-validation.pipe.js'
import { DepartmentsRepository } from './departments.repository.js'

@Controller()
export class DepartmentsController {
  constructor(@Inject(DepartmentsRepository) private readonly repository: DepartmentsRepository) {}

  @Get('/admin/departments')
  @RequirePermissions(authorizationPermissionKeys.departmentsManage)
  @ContractRoute({
    operationId: 'listDepartments',
    tags: ['Departments'],
    response: DepartmentListResultSchema,
  })
  async list() {
    return success(await this.repository.listDepartments())
  }

  @Get('/admin/departments/options')
  @RequirePermissions(
    authorizationPermissionKeys.departmentsManage,
    authorizationPermissionKeys.usersManage,
    authorizationPermissionKeys.rolesManage,
    authorizationPermissionKeys.positionsManage,
  )
  @ContractRoute({
    operationId: 'listDepartmentOptions',
    tags: ['Departments'],
    response: DepartmentOptionListResultSchema,
  })
  async options() {
    return success(await this.repository.listDepartmentOptions())
  }

  @Post('/admin/departments')
  @RequirePermissions(authorizationPermissionKeys.departmentsManage)
  @ContractRoute({
    operationId: 'createDepartment',
    tags: ['Departments'],
    body: DepartmentRequestSchema,
    response: MutationResultSchema,
  })
  async create(
    @Body(new ZodValidationPipe(DepartmentRequestSchema)) body: DepartmentRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (!(await this.repository.validateDepartmentParent(body.parentId))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid parent department')
    }
    return mutationResult(() => this.repository.createDepartment(body, actor.id))
  }

  @Put('/admin/departments/:id')
  @RequirePermissions(authorizationPermissionKeys.departmentsManage)
  @ContractRoute({
    operationId: 'updateDepartment',
    tags: ['Departments'],
    params: IdParamsSchema,
    body: DepartmentRequestSchema,
    response: MutationResultSchema,
  })
  async update(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(DepartmentRequestSchema)) body: DepartmentRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (!(await this.repository.validateDepartmentParent(body.parentId, params.id))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid parent department')
    }
    ensureUpdated(await this.repository.updateDepartment(params.id, body, actor.id))
    return success({ id: params.id })
  }

  @Delete('/admin/departments/:id')
  @RequirePermissions(authorizationPermissionKeys.departmentsManage)
  @ContractRoute({
    operationId: 'deleteDepartment',
    tags: ['Departments'],
    params: IdParamsSchema,
    response: EmptyResultSchema,
  })
  async remove(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (!(await this.repository.canDeleteDepartment(params.id))) {
      return failure(
        ErrorCode.RESOURCE_CONFLICT,
        'Department still has child departments, active users or policy references',
      )
    }
    ensureUpdated(await this.repository.softDeleteDepartment(params.id, actor.id))
    return success()
  }
}
