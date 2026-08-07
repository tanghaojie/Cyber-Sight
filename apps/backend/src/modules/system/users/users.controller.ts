import { Body, Controller, Delete, Get, Inject, Param, Post, Put, Query } from '@nestjs/common'
import {
  EmptyResultSchema,
  IdParamsSchema,
  ListQuerySchema,
  MutationResultSchema,
  PasswordUpdateSchema,
  PersonalProfileResultSchema,
  PersonalProfileUpdateSchema,
  UserCreateSchema,
  UserPageResultSchema,
  UserUpdateSchema,
  type CurrentUser,
  type IdParams,
  type ListQuery,
  type PasswordUpdate,
  type PersonalProfileUpdate,
  type UserCreate,
  type UserUpdate,
} from '@scaffold/api-contract'
import {
  Authenticated,
  authorizationProviderToken,
  CurrentAccessUser,
  RequirePermissions,
} from '@/modules/system/authorization/authorization.guard.js'
import type { AuthorizationProvider } from '@/modules/system/authorization/authorization.provider.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { invalidateUserTokenCache, revokeUserTokens } from '@/modules/system/auth/auth.service.js'
import { enabledDepartmentIds } from '@/modules/system/departments/departments.access.js'
import { enabledRoleIds } from '@/modules/system/roles/roles.access.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { forbidden, notFound } from '@/shared/errors/http-errors.js'
import { ContractRoute } from '@/shared/http/contract.js'
import {
  ensureUpdated,
  isUniqueViolation,
  mutationResult,
  normalizedListQuery,
} from '@/shared/http/route-helpers.js'
import { failure, paginatedSuccess, success } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import {
  canAssignUserDepartments,
  changePersonalPassword,
  createUser,
  listUsers,
  personalProfileForUser,
  softDeleteUser,
  updatePersonalProfile,
  updateUser,
} from './users.repository.js'

@Controller()
export class UsersController {
  constructor(
    @Inject(BackendRuntime) private readonly runtime: BackendRuntime,
    @Inject(authorizationProviderToken)
    private readonly authorization: AuthorizationProvider,
  ) {}

  @Get('/account/profile')
  @Authenticated()
  @ContractRoute({
    operationId: 'getPersonalProfile',
    tags: ['Users'],
    response: PersonalProfileResultSchema,
  })
  async profile(@CurrentAccessUser() actor: CurrentUser) {
    const profile = await personalProfileForUser(this.runtime, actor.id)
    if (!profile) {
      throw notFound()
    }
    return success(profile)
  }

  @Put('/account/profile')
  @Authenticated()
  @ContractRoute({
    operationId: 'updatePersonalProfile',
    tags: ['Users'],
    body: PersonalProfileUpdateSchema,
    response: PersonalProfileResultSchema,
  })
  async updateProfile(
    @Body(new ZodValidationPipe(PersonalProfileUpdateSchema)) body: PersonalProfileUpdate,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    try {
      const profile = await updatePersonalProfile(this.runtime, actor.id, body)
      if (!profile) {
        throw notFound()
      }
      invalidateUserTokenCache(this.runtime, actor.id)
      return success(profile)
    } catch (error) {
      if (isUniqueViolation(error)) {
        return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
      }
      throw error
    }
  }

  @Put('/account/password')
  @Authenticated()
  @ContractRoute({
    operationId: 'updatePersonalPassword',
    tags: ['Users'],
    body: PasswordUpdateSchema,
    response: EmptyResultSchema,
  })
  async updatePassword(
    @Body(new ZodValidationPipe(PasswordUpdateSchema)) body: PasswordUpdate,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    const result = await changePersonalPassword(this.runtime, actor.id, body)
    if (result === 'not-found') {
      throw notFound()
    }
    if (result === 'invalid-current-password') {
      return failure(ErrorCode.INVALID_CREDENTIALS, 'Current password is incorrect')
    }
    await revokeUserTokens(this.runtime, actor.id, actor.id)
    return success()
  }

  @Get('/admin/users')
  @RequirePermissions(authorizationPermissionKeys.usersManage)
  @ContractRoute({
    operationId: 'listUsers',
    tags: ['Users'],
    query: ListQuerySchema,
    response: UserPageResultSchema,
  })
  async list(
    @Query(new ZodValidationPipe(ListQuerySchema)) query: ListQuery,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    const access = await this.authorization.resolveDataAccess(this.runtime, actor, 'users', 'read')
    const page = await listUsers(this.runtime, normalizedListQuery(query), access)
    return paginatedSuccess(page.list, page.total)
  }

  @Post('/admin/users')
  @RequirePermissions(authorizationPermissionKeys.usersManage)
  @ContractRoute({
    operationId: 'createUser',
    tags: ['Users'],
    body: UserCreateSchema,
    response: MutationResultSchema,
  })
  async create(
    @Body(new ZodValidationPipe(UserCreateSchema)) body: UserCreate,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (!(await this.hasValidAssignments(body.roleIds, body.departmentIds))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid role or department assignment')
    }
    const access = await this.authorization.resolveDataAccess(
      this.runtime,
      actor,
      'users',
      'create',
    )
    if (!(await canAssignUserDepartments(this.runtime, body.departmentIds, access))) {
      return failure(ErrorCode.FORBIDDEN, 'Data scope does not allow these departments')
    }
    return mutationResult(() => createUser(this.runtime, body, actor.id))
  }

  @Put('/admin/users/:id')
  @RequirePermissions(authorizationPermissionKeys.usersManage)
  @ContractRoute({
    operationId: 'updateUser',
    tags: ['Users'],
    params: IdParamsSchema,
    body: UserUpdateSchema,
    response: MutationResultSchema,
  })
  async update(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @Body(new ZodValidationPipe(UserUpdateSchema)) body: UserUpdate,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (!(await this.hasValidAssignments(body.roleIds, body.departmentIds))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid role or department assignment')
    }
    const access = await this.authorization.resolveDataAccess(
      this.runtime,
      actor,
      'users',
      'update',
    )
    if (!(await canAssignUserDepartments(this.runtime, body.departmentIds, access, params.id))) {
      return failure(ErrorCode.FORBIDDEN, 'Data scope does not allow these departments')
    }
    try {
      ensureUpdated(await updateUser(this.runtime, params.id, body, actor.id, access))
      invalidateUserTokenCache(this.runtime, params.id)
      return success({ id: params.id })
    } catch (error) {
      if (isUniqueViolation(error)) {
        return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
      }
      throw error
    }
  }

  @Delete('/admin/users/:id')
  @RequirePermissions(authorizationPermissionKeys.usersManage)
  @ContractRoute({
    operationId: 'deleteUser',
    tags: ['Users'],
    params: IdParamsSchema,
    response: EmptyResultSchema,
  })
  async remove(
    @Param(new ZodValidationPipe(IdParamsSchema)) params: IdParams,
    @CurrentAccessUser() actor: CurrentUser,
  ) {
    if (actor.id === params.id) {
      throw forbidden('You cannot delete your own account')
    }
    const access = await this.authorization.resolveDataAccess(
      this.runtime,
      actor,
      'users',
      'delete',
    )
    ensureUpdated(await softDeleteUser(this.runtime, params.id, actor.id, access))
    await revokeUserTokens(this.runtime, params.id, actor.id)
    return success()
  }

  private async hasValidAssignments(roleIds: number[], departmentIds: number[]): Promise<boolean> {
    const [validRoleIds, validDepartmentIds] = await Promise.all([
      enabledRoleIds(this.runtime, roleIds),
      enabledDepartmentIds(this.runtime, departmentIds),
    ])
    return (
      validRoleIds.length === roleIds.length && validDepartmentIds.length === departmentIds.length
    )
  }
}
