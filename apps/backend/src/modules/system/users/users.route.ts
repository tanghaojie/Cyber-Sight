import type { FastifyInstance } from 'fastify'
import {
  EmptyResultSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  ListQuerySchema,
  MutationResultSchema,
  PasswordUpdateSchema,
  PersonalProfileResultSchema,
  PersonalProfileUpdateSchema,
  toFastifySchema,
  UserCreateSchema,
  UserPageResultSchema,
  UserUpdateSchema,
  type IdParams,
  type ListQuery,
  type PasswordUpdate,
  type PersonalProfileUpdate,
  type UserCreate,
  type UserUpdate,
} from '@scaffold/api-contract'
import {
  invalidateUserTokenCache,
  requireCurrentUser,
  revokeUserTokens,
} from '@/modules/system/auth/auth.service.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import {
  ensureUpdated,
  isUniqueViolation,
  mutationResult,
  normalizedListQuery,
} from '@/shared/http/route-helpers.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { enabledDepartmentIds } from '@/modules/system/departments/departments.access.js'
import { enabledRoleIds } from '@/modules/system/roles/roles.access.js'
import { failure, paginatedSuccess, success } from '@/shared/http/response.js'
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

async function hasValidAssignments(
  app: FastifyInstance,
  roleIds: number[],
  departmentIds: number[],
): Promise<boolean> {
  // 写入前确认所有关联目标仍启用且未删除，防止创建悬空或失效关系。
  const [validRoleIds, validDepartmentIds] = await Promise.all([
    enabledRoleIds(app, roleIds),
    enabledDepartmentIds(app, departmentIds),
  ])
  return (
    validRoleIds.length === roleIds.length && validDepartmentIds.length === departmentIds.length
  )
}

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/account/profile',
    {
      config: { authorization: { mode: 'authenticated' } },
      schema: {
        operationId: 'getPersonalProfile',
        tags: ['Users'],
        response: {
          200: toFastifySchema(PersonalProfileResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function getPersonalProfileHandler(request) {
      const actor = await requireCurrentUser(app, request)
      const profile = await personalProfileForUser(app, actor.id)
      if (!profile) {
        throw app.httpErrors.notFound('Resource not found')
      }
      return success(profile)
    },
  )

  app.put<{ Body: PersonalProfileUpdate }>(
    '/account/profile',
    {
      config: { authorization: { mode: 'authenticated' } },
      schema: {
        operationId: 'updatePersonalProfile',
        tags: ['Users'],
        body: toFastifySchema(PersonalProfileUpdateSchema),
        response: {
          200: toFastifySchema(PersonalProfileResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function updatePersonalProfileHandler(request) {
      const actor = await requireCurrentUser(app, request)
      try {
        const profile = await updatePersonalProfile(app, actor.id, request.body)
        if (!profile) {
          throw app.httpErrors.notFound('Resource not found')
        }
        invalidateUserTokenCache(app, actor.id)
        return success(profile)
      } catch (error) {
        if (isUniqueViolation(error)) {
          return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
        }
        throw error
      }
    },
  )

  app.put<{ Body: PasswordUpdate }>(
    '/account/password',
    {
      config: { authorization: { mode: 'authenticated' } },
      schema: {
        operationId: 'updatePersonalPassword',
        tags: ['Users'],
        body: toFastifySchema(PasswordUpdateSchema),
        response: {
          200: toFastifySchema(EmptyResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function updatePersonalPasswordHandler(request) {
      const actor = await requireCurrentUser(app, request)
      const result = await changePersonalPassword(app, actor.id, request.body)
      if (result === 'not-found') {
        throw app.httpErrors.notFound('Resource not found')
      }
      if (result === 'invalid-current-password') {
        return failure(ErrorCode.INVALID_CREDENTIALS, 'Current password is incorrect')
      }
      await revokeUserTokens(app, actor.id, actor.id)
      return success()
    },
  )

  // 功能权限决定能否调用接口，数据访问计划进一步限制可见和可修改的用户记录。
  app.get<{ Querystring: ListQuery }>(
    '/admin/users',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.usersManage] },
      },
      schema: {
        operationId: 'listUsers',
        tags: ['Users'],
        querystring: toFastifySchema(ListQuerySchema),
        response: {
          200: toFastifySchema(UserPageResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      const access = await app.authorization.resolveDataAccess(app, actor, 'users', 'read')
      const page = await listUsers(app, normalizedListQuery(request.query), access)
      return paginatedSuccess(page.list, page.total)
    },
  )

  app.post<{ Body: UserCreate }>(
    '/admin/users',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.usersManage] },
      },
      schema: {
        operationId: 'createUser',
        tags: ['Users'],
        body: toFastifySchema(UserCreateSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function createUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (!(await hasValidAssignments(app, request.body.roleIds, request.body.departmentIds))) {
        return failure(ErrorCode.INVALID_REQUEST, 'Invalid role or department assignment')
      }
      const access = await app.authorization.resolveDataAccess(app, actor, 'users', 'create')
      if (!(await canAssignUserDepartments(app, request.body.departmentIds, access))) {
        return failure(ErrorCode.FORBIDDEN, 'Data scope does not allow these departments')
      }
      return mutationResult(() => createUser(app, request.body, actor.id))
    },
  )

  app.put<{ Params: IdParams; Body: UserUpdate }>(
    '/admin/users/:id',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.usersManage] },
      },
      schema: {
        operationId: 'updateUser',
        tags: ['Users'],
        params: toFastifySchema(IdParamsSchema),
        body: toFastifySchema(UserUpdateSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function updateUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (!(await hasValidAssignments(app, request.body.roleIds, request.body.departmentIds))) {
        return failure(ErrorCode.INVALID_REQUEST, 'Invalid role or department assignment')
      }
      const access = await app.authorization.resolveDataAccess(app, actor, 'users', 'update')
      if (
        !(await canAssignUserDepartments(
          app,
          request.body.departmentIds,
          access,
          request.params.id,
        ))
      ) {
        return failure(ErrorCode.FORBIDDEN, 'Data scope does not allow these departments')
      }
      try {
        ensureUpdated(app, await updateUser(app, request.params.id, request.body, actor.id, access))
        // 用户状态、角色或密码变化后丢弃旧身份快照，下一次请求重新从持久会话加载。
        invalidateUserTokenCache(app, request.params.id)
        return success({ id: request.params.id })
      } catch (error) {
        if (isUniqueViolation(error)) {
          return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
        }
        throw error
      }
    },
  )

  app.delete<{ Params: IdParams }>(
    '/admin/users/:id',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.usersManage] },
      },
      schema: {
        operationId: 'deleteUser',
        tags: ['Users'],
        params: toFastifySchema(IdParamsSchema),
        response: {
          200: toFastifySchema(EmptyResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function deleteUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (actor.id === request.params.id) {
        // 禁止删除当前账户，避免管理员在当前会话中把自身置于不可恢复状态。
        throw app.httpErrors.forbidden('You cannot delete your own account')
      }
      const access = await app.authorization.resolveDataAccess(app, actor, 'users', 'delete')
      ensureUpdated(app, await softDeleteUser(app, request.params.id, actor.id, access))
      // 软删除用户后撤销其所有会话，阻止已有令牌继续访问系统。
      await revokeUserTokens(app, request.params.id, actor.id)
      return success()
    },
  )
}
