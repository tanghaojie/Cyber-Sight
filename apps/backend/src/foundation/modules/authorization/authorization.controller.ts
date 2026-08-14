import { Body, Controller, Get, Inject, Param, Put } from '@nestjs/common'
import {
  DataResourceListResultSchema,
  IdParamsSchema,
  MutationResultSchema,
  PermissionListResultSchema,
  SubjectAccessRequestSchema,
  SubjectAccessResultSchema,
  type AuthorizationSubjectType,
  type CurrentUser,
  type EntityId,
  type IdParams,
  type SubjectAccessRequest,
} from '@cyber-ai-forge/api-contract'
import {
  authorizationProviderToken,
  CurrentAccessUser,
  RequirePermissions,
} from '@/foundation/modules/authorization/authorization.guard.js'
import { AuthService } from '@/foundation/modules/auth/auth.service.js'
import type { AuthorizationProvider } from './authorization.provider.js'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'
import { notFound } from '@/foundation/shared/errors/http-errors.js'
import { ContractRoute } from '@/foundation/shared/http/contract.js'
import { failure, success } from '@/foundation/shared/http/response.js'
import { ZodValidationPipe } from '@/foundation/shared/http/zod-validation.pipe.js'
import { authorizationPermissionKeys, dataResourceDefinitions } from './authorization.resources.js'
import { AuthorizationService } from './authorization.service.js'

const accessAdministrationPermissions = [
  authorizationPermissionKeys.usersManage,
  authorizationPermissionKeys.rolesManage,
  authorizationPermissionKeys.departmentsManage,
  authorizationPermissionKeys.menusManage,
]

@Controller()
export class AuthorizationController {
  constructor(
    @Inject(AuthorizationService)
    private readonly authorization: AuthorizationService,
    @Inject(authorizationProviderToken)
    private readonly provider: AuthorizationProvider,
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Get('/admin/authorization/permissions')
  @RequirePermissions(...accessAdministrationPermissions)
  @ContractRoute({
    operationId: 'listAuthorizationPermissions',
    tags: ['Authorization'],
    response: PermissionListResultSchema,
  })
  async permissions() {
    return success(await this.authorization.listPermissions())
  }

  @Get('/admin/authorization/data-resources')
  @RequirePermissions(...accessAdministrationPermissions)
  @ContractRoute({
    operationId: 'listAuthorizationDataResources',
    tags: ['Authorization'],
    response: DataResourceListResultSchema,
  })
  resources() {
    return success(dataResourceDefinitions)
  }

  @Get('/admin/authorization/users/:id')
  @RequirePermissions(authorizationPermissionKeys.usersManage)
  @ContractRoute({
    operationId: 'getUserAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    response: SubjectAccessResultSchema,
  })
  getUser(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return this.getAccess(actor, 'user', params.id)
  }

  @Put('/admin/authorization/users/:id')
  @RequirePermissions(authorizationPermissionKeys.usersManage)
  @ContractRoute({
    operationId: 'replaceUserAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    body: SubjectAccessRequestSchema,
    response: MutationResultSchema,
  })
  putUser(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(SubjectAccessRequestSchema)) body: SubjectAccessRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return this.replaceAccess(actor, 'user', params.id, body)
  }

  @Get('/admin/authorization/roles/:id')
  @RequirePermissions(authorizationPermissionKeys.rolesManage)
  @ContractRoute({
    operationId: 'getRoleAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    response: SubjectAccessResultSchema,
  })
  getRole(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return this.getAccess(actor, 'role', params.id)
  }

  @Put('/admin/authorization/roles/:id')
  @RequirePermissions(authorizationPermissionKeys.rolesManage)
  @ContractRoute({
    operationId: 'replaceRoleAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    body: SubjectAccessRequestSchema,
    response: MutationResultSchema,
  })
  putRole(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(SubjectAccessRequestSchema)) body: SubjectAccessRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return this.replaceAccess(actor, 'role', params.id, body)
  }

  @Get('/admin/authorization/departments/:id')
  @RequirePermissions(authorizationPermissionKeys.departmentsManage)
  @ContractRoute({
    operationId: 'getDepartmentAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    response: SubjectAccessResultSchema,
  })
  getDepartment(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return this.getAccess(actor, 'department', params.id)
  }

  @Put('/admin/authorization/departments/:id')
  @RequirePermissions(authorizationPermissionKeys.departmentsManage)
  @ContractRoute({
    operationId: 'replaceDepartmentAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    body: SubjectAccessRequestSchema,
    response: MutationResultSchema,
  })
  putDepartment(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(SubjectAccessRequestSchema)) body: SubjectAccessRequest,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    return this.replaceAccess(actor, 'department', params.id, body)
  }

  private async getAccess(actor: CurrentUser, subjectType: AuthorizationSubjectType, id: EntityId) {
    if (
      !(await this.authorization.authorizationSubjectExists(subjectType, id)) ||
      !(await this.provider.canAccessSubject(actor, subjectType, id, 'read'))
    ) {
      throw notFound()
    }
    return success(await this.authorization.getSubjectAccess(subjectType, id))
  }

  private async replaceAccess(
    actor: CurrentUser,
    subjectType: AuthorizationSubjectType,
    id: EntityId,
    body: SubjectAccessRequest,
  ) {
    if (
      !(await this.authorization.authorizationSubjectExists(subjectType, id)) ||
      !(await this.provider.canAccessSubject(actor, subjectType, id, 'update'))
    ) {
      throw notFound()
    }
    if (!(await this.provider.canDelegateSubjectAccess(actor, subjectType, id, body))) {
      return failure(ErrorCode.FORBIDDEN, 'Authorization delegation exceeds current access')
    }
    if (!(await this.authorization.replaceSubjectAccess(subjectType, id, body, actor.id))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid permission or data policy')
    }
    if (subjectType === 'user') {
      this.authService.invalidateUserTokenCache(id)
    } else {
      this.authService.invalidateAllTokenCache()
    }
    return success({ id })
  }
}
