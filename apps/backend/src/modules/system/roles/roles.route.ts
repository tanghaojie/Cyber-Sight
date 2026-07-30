import type { FastifyInstance } from 'fastify'
import {
  EmptyResultSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  ListQuerySchema,
  MutationResultSchema,
  RolePageResultSchema,
  RoleRequestSchema,
  toFastifySchema,
  type IdParams,
  type ListQuery,
  type RoleRequest,
} from '@scaffold/api-contract'
import { invalidateAllTokenCache, requireCurrentUser } from '@/modules/system/auth/auth.service.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { ensureUpdated, mutationResult, normalizedListQuery } from '@/shared/http/route-helpers.js'
import { paginatedSuccess, success } from '@/shared/http/response.js'
import { createRole, listRoles, softDeleteRole, updateRole } from './roles.repository.js'

/** 角色管理路由；角色变更会影响有效权限，因此写操作后必须清空令牌身份缓存。 */
export async function roleRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ListQuery }>(
    '/admin/roles',
    {
      config: {
        authorization: {
          mode: 'permission',
          anyOf: [authorizationPermissionKeys.rolesManage, authorizationPermissionKeys.usersManage],
        },
      },
      schema: {
        operationId: 'listRoles',
        tags: ['Roles'],
        querystring: toFastifySchema(ListQuerySchema),
        response: {
          200: toFastifySchema(RolePageResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listRoleHandler(request) {
      // 用户编辑页也需要角色选项，因此 users.manage 可读取角色列表但不能写入。
      await requireCurrentUser(app, request)
      const page = await listRoles(app, normalizedListQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    },
  )
  app.post<{ Body: RoleRequest }>(
    '/admin/roles',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.rolesManage] },
      },
      schema: {
        operationId: 'createRole',
        tags: ['Roles'],
        body: toFastifySchema(RoleRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function createRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createRole(app, request.body, actor.id))
    },
  )
  app.put<{ Params: IdParams; Body: RoleRequest }>(
    '/admin/roles/:id',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.rolesManage] },
      },
      schema: {
        operationId: 'updateRole',
        tags: ['Roles'],
        params: toFastifySchema(IdParamsSchema),
        body: toFastifySchema(RoleRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function updateRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await updateRole(app, request.params.id, request.body, actor.id))
      // 缓存中的 CurrentUser.roles 以及由角色派生的权限都需要重新加载。
      invalidateAllTokenCache(app)
      return success({ id: request.params.id })
    },
  )
  app.delete<{ Params: IdParams }>(
    '/admin/roles/:id',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.rolesManage] },
      },
      schema: {
        operationId: 'deleteRole',
        tags: ['Roles'],
        params: toFastifySchema(IdParamsSchema),
        response: {
          200: toFastifySchema(EmptyResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function deleteRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await softDeleteRole(app, request.params.id, actor.id))
      invalidateAllTokenCache(app)
      return success()
    },
  )
}
