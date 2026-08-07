import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common'
import {
  EmptyResultSchema,
  IdParamsSchema,
  ListQuerySchema,
  MutationResultSchema,
  RolePageResultSchema,
  RoleRequestSchema,
  type CurrentUser,
  type IdParams,
  type ListQuery,
  type RoleRequest,
} from '@scaffold/api-contract'
import {
  CurrentAccessUser,
  RequirePermissions,
} from '@/modules/system/authorization/authorization.guard.js'
import { invalidateAllTokenCache } from '@/modules/system/auth/auth.service.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { ensureUpdated, mutationResult, normalizedListQuery } from '@/shared/http/route-helpers.js'
import { paginatedSuccess, success } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import { createRole, listRoles, softDeleteRole, updateRole } from './roles.repository.js'

@Controller()
export class RolesController {
  constructor(@Inject(BackendRuntime) private readonly runtime: BackendRuntime) {}

  @Get('/admin/roles')
  @RequirePermissions(
    authorizationPermissionKeys.rolesManage,
    authorizationPermissionKeys.usersManage,
  )
  @ContractRoute({
    operationId: 'listRoles',
    tags: ['Roles'],
    query: ListQuerySchema,
    response: RolePageResultSchema,
  })
  async list(@Query(new ZodValidationPipe(ListQuerySchema)) query: ListQuery) {
    const page = await listRoles(this.runtime, normalizedListQuery(query))
    return paginatedSuccess(page.list, page.total)
  }

  @Post('/admin/roles')
  @RequirePermissions(authorizationPermissionKeys.rolesManage)
  @ContractRoute({
    operationId: 'createRole',
    tags: ['Roles'],
    body: RoleRequestSchema,
    response: MutationResultSchema,
  })
  create(
    @Body(new ZodValidationPipe(RoleRequestSchema)) body: RoleRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return mutationResult(() => createRole(this.runtime, body, actor.id))
  }

  @Put('/admin/roles/:id')
  @RequirePermissions(authorizationPermissionKeys.rolesManage)
  @ContractRoute({
    operationId: 'updateRole',
    tags: ['Roles'],
    params: IdParamsSchema,
    body: RoleRequestSchema,
    response: MutationResultSchema,
  })
  async update(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(RoleRequestSchema)) body: RoleRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    ensureUpdated(await updateRole(this.runtime, params.id, body, actor.id))
    invalidateAllTokenCache(this.runtime)
    return success({ id: params.id })
  }

  @Delete('/admin/roles/:id')
  @RequirePermissions(authorizationPermissionKeys.rolesManage)
  @ContractRoute({
    operationId: 'deleteRole',
    tags: ['Roles'],
    params: IdParamsSchema,
    response: EmptyResultSchema,
  })
  async remove(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    ensureUpdated(await softDeleteRole(this.runtime, params.id, actor.id))
    invalidateAllTokenCache(this.runtime)
    return success()
  }
}
