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
} from '@cyber-ai-forge/api-contract'
import {
  Authenticated,
  authorizationProviderToken,
  CurrentAccessUser,
  RequirePermissions,
} from '@/foundation/modules/authorization/authorization.guard.js'
import type { AuthorizationProvider } from '@/foundation/modules/authorization/authorization.provider.js'
import { authorizationPermissionKeys } from '@/foundation/modules/authorization/authorization.resources.js'
import { AuthService } from '@/foundation/modules/auth/auth.service.js'
import { isInvalidPositionAssignment } from '@/foundation/modules/positions/positions.service.js'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'
import { forbidden, notFound } from '@/foundation/shared/errors/http-errors.js'
import { ContractRoute } from '@/foundation/shared/http/contract.js'
import {
  ensureUpdated,
  isUniqueViolation,
  mutationResult,
  normalizedListQuery,
} from '@/foundation/shared/http/route-helpers.js'
import { failure, paginatedSuccess, success } from '@/foundation/shared/http/response.js'
import { ZodValidationPipe } from '@/foundation/shared/http/zod-validation.pipe.js'
import { UsersRepository } from './users.repository.js'

@Controller()
export class UsersController {
  constructor(
    @Inject(UsersRepository)
    private readonly repository: UsersRepository,
    @Inject(AuthService)
    private readonly authService: AuthService,
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
    const profile = await this.repository.personalProfileForUser(actor.id)
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
      const profile = await this.repository.updatePersonalProfile(actor.id, body)
      if (!profile) {
        throw notFound()
      }
      this.authService.invalidateUserTokenCache(actor.id)
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
    const result = await this.repository.changePersonalPassword(actor.id, body)
    if (result === 'not-found') {
      throw notFound()
    }
    if (result === 'invalid-current-password') {
      return failure(ErrorCode.INVALID_CREDENTIALS, 'Current password is incorrect')
    }
    await this.authService.revokeUserTokens(actor.id, actor.id)
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
    const access = await this.authorization.resolveDataAccess(actor, 'users', 'read')
    const page = await this.repository.listUsers(normalizedListQuery(query), access)
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
    if (
      !(await this.repository.hasValidAssignments(
        body.roleIds,
        body.departmentIds,
        body.positionIds,
      ))
    ) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid role, department or position assignment')
    }
    if (
      !(await this.authorization.canManageUserAuthorizationContext(
        actor,
        null,
        body.roleIds,
        body.departmentIds,
      ))
    ) {
      return failure(ErrorCode.FORBIDDEN, 'Authorization delegation exceeds current access')
    }
    const access = await this.authorization.resolveDataAccess(actor, 'users', 'create')
    if (!(await this.repository.canAssignUserDepartments(body.departmentIds, access))) {
      return failure(ErrorCode.FORBIDDEN, 'Data scope does not allow these departments')
    }
    try {
      return await mutationResult(() => this.repository.createUser(body, actor.id))
    } catch (error) {
      if (isInvalidPositionAssignment(error)) {
        return failure(ErrorCode.INVALID_REQUEST, 'Invalid position assignment')
      }
      throw error
    }
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
    const access = await this.authorization.resolveDataAccess(actor, 'users', 'update')
    if (!(await this.repository.userExistsWithinAccess(params.id, access))) {
      throw notFound()
    }
    if (
      !(await this.repository.hasValidAssignments(
        body.roleIds,
        body.departmentIds,
        body.positionIds,
      ))
    ) {
      return failure(ErrorCode.INVALID_REQUEST, 'Invalid role, department or position assignment')
    }
    if (
      !(await this.authorization.canManageUserAuthorizationContext(
        actor,
        params.id,
        body.roleIds,
        body.departmentIds,
      ))
    ) {
      return failure(ErrorCode.FORBIDDEN, 'Authorization delegation exceeds current access')
    }
    if (!(await this.repository.canAssignUserDepartments(body.departmentIds, access, params.id))) {
      return failure(ErrorCode.FORBIDDEN, 'Data scope does not allow these departments')
    }
    try {
      ensureUpdated(await this.repository.updateUser(params.id, body, actor.id, access))
      this.authService.invalidateUserTokenCache(params.id)
      return success({ id: params.id })
    } catch (error) {
      if (isUniqueViolation(error)) {
        return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
      }
      if (isInvalidPositionAssignment(error)) {
        return failure(ErrorCode.INVALID_REQUEST, 'Invalid position assignment')
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
    const access = await this.authorization.resolveDataAccess(actor, 'users', 'delete')
    ensureUpdated(await this.repository.softDeleteUser(params.id, actor.id, access))
    await this.authService.revokeUserTokens(params.id, actor.id)
    return success()
  }
}
