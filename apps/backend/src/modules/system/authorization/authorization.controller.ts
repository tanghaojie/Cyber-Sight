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
  type IdParams,
  type SubjectAccessRequest,
} from '@cyber-ai-forge/api-contract'
import {
  CurrentAccessUser,
  RequirePermissions,
} from '@/modules/system/authorization/authorization.guard.js'
import { AuthService } from '@/modules/system/auth/auth.service.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { notFound } from '@/shared/errors/http-errors.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { failure, success } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
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
  getUser(@Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams) {
    return this.getAccess('user', params.id)
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
    return this.replaceAccess('user', params.id, body, actor.id)
  }

  @Get('/admin/authorization/roles/:id')
  @RequirePermissions(authorizationPermissionKeys.rolesManage)
  @ContractRoute({
    operationId: 'getRoleAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    response: SubjectAccessResultSchema,
  })
  getRole(@Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams) {
    return this.getAccess('role', params.id)
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
    return this.replaceAccess('role', params.id, body, actor.id)
  }

  @Get('/admin/authorization/departments/:id')
  @RequirePermissions(authorizationPermissionKeys.departmentsManage)
  @ContractRoute({
    operationId: 'getDepartmentAccess',
    tags: ['Authorization'],
    params: IdParamsSchema,
    response: SubjectAccessResultSchema,
  })
  getDepartment(@Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams) {
    return this.getAccess('department', params.id)
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
    return this.replaceAccess('department', params.id, body, actor.id)
  }

  private async getAccess(subjectType: AuthorizationSubjectType, id: number) {
    if (!(await this.authorization.authorizationSubjectExists(subjectType, id))) {
      throw notFound()
    }
    return success(await this.authorization.getSubjectAccess(subjectType, id))
  }

  private async replaceAccess(
    subjectType: AuthorizationSubjectType,
    id: number,
    body: SubjectAccessRequest,
    actorId: number,
  ) {
    if (!(await this.authorization.authorizationSubjectExists(subjectType, id))) {
      throw notFound()
    }
    if (!(await this.authorization.replaceSubjectAccess(subjectType, id, body, actorId))) {
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
