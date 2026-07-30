import type { FastifyInstance } from 'fastify'
import {
  EmptyResultSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  ListQuerySchema,
  MenuPageResultSchema,
  MenuListResponseSchema,
  MenuRequestSchema,
  MutationResultSchema,
  NavigationMenuResponseSchema,
  toFastifySchema,
  type IdParams,
  type ListQuery,
  type MenuRequest,
  isValidMenuPath,
} from '@scaffold/api-contract'
import { requireCurrentUser } from '@/modules/auth/auth.service.js'
import { authorizationPermissionKeys } from '@/modules/authorization/authorization.resources.js'
import { activePermissionKeyExists } from '@/modules/authorization/authorization.references.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { ensureUpdated, mutationResult, normalizedListQuery } from '@/shared/http/route-helpers.js'
import { failure, paginatedSuccess, success } from '@/shared/http/response.js'
import {
  createMenu,
  hasActiveMenuChildren,
  listMenus,
  listAllMenus,
  listNavigationMenus,
  softDeleteMenu,
  updateMenu,
  validateMenuParent,
} from './menus.repository.js'

export async function menuRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ListQuery }>(
    '/admin/menus',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.menusManage] },
      },
      schema: {
        operationId: 'listMenus',
        tags: ['Menus'],
        querystring: toFastifySchema(ListQuerySchema),
        response: {
          200: toFastifySchema(MenuPageResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listMenuHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listMenus(app, normalizedListQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    },
  )

  app.get(
    '/navigation/menus',
    {
      config: { authorization: { mode: 'authenticated' } },
      schema: {
        operationId: 'getCurrentNavigation',
        tags: ['Navigation'],
        response: {
          200: toFastifySchema(NavigationMenuResponseSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function currentNavigationHandler(request) {
      const user = await requireCurrentUser(app, request)
      return success(await listNavigationMenus(app, user))
    },
  )

  app.get(
    '/admin/menus/tree',
    {
      config: {
        authorization: {
          mode: 'permission',
          anyOf: [authorizationPermissionKeys.menusManage, authorizationPermissionKeys.rolesManage],
        },
      },
      schema: {
        operationId: 'listMenuTree',
        tags: ['Menus'],
        response: {
          200: toFastifySchema(MenuListResponseSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listMenuTreeHandler(request) {
      await requireCurrentUser(app, request)
      return success(await listAllMenus(app))
    },
  )

  app.post<{ Body: MenuRequest }>(
    '/admin/menus',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.menusManage] },
      },
      schema: {
        operationId: 'createMenu',
        tags: ['Menus'],
        body: toFastifySchema(MenuRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function createMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (!isValidMenuPath(request.body)) {
        return failure(ErrorCode.INVALID_REQUEST, 'Root menu path must start with /')
      }
      if (!(await validateMenuParent(app, request.body.parentId))) {
        return failure(ErrorCode.INVALID_REQUEST, 'Parent menu must be an existing directory')
      }
      if (
        request.body.requiredPermissionKey &&
        !(await activePermissionKeyExists(app, request.body.requiredPermissionKey))
      ) {
        return failure(ErrorCode.INVALID_REQUEST, 'Permission key is not active')
      }
      return mutationResult(() => createMenu(app, request.body, actor.id))
    },
  )

  app.put<{ Params: IdParams; Body: MenuRequest }>(
    '/admin/menus/:id',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.menusManage] },
      },
      schema: {
        operationId: 'updateMenu',
        tags: ['Menus'],
        params: toFastifySchema(IdParamsSchema),
        body: toFastifySchema(MenuRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function updateMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (!isValidMenuPath(request.body)) {
        return failure(ErrorCode.INVALID_REQUEST, 'Root menu path must start with /')
      }
      if (!(await validateMenuParent(app, request.body.parentId, request.params.id))) {
        return failure(
          ErrorCode.INVALID_REQUEST,
          'Parent menu must be a directory outside the current subtree',
        )
      }
      if (
        request.body.requiredPermissionKey &&
        !(await activePermissionKeyExists(app, request.body.requiredPermissionKey))
      ) {
        return failure(ErrorCode.INVALID_REQUEST, 'Permission key is not active')
      }
      ensureUpdated(app, await updateMenu(app, request.params.id, request.body, actor.id))
      return success({ id: request.params.id })
    },
  )

  app.delete<{ Params: IdParams }>(
    '/admin/menus/:id',
    {
      config: {
        authorization: { mode: 'permission', anyOf: [authorizationPermissionKeys.menusManage] },
      },
      schema: {
        operationId: 'deleteMenu',
        tags: ['Menus'],
        params: toFastifySchema(IdParamsSchema),
        response: {
          200: toFastifySchema(EmptyResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function deleteMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (await hasActiveMenuChildren(app, request.params.id)) {
        return failure(
          ErrorCode.RESOURCE_CONFLICT,
          'Delete child menus before deleting this directory',
        )
      }
      ensureUpdated(app, await softDeleteMenu(app, request.params.id, actor.id))
      return success()
    },
  )
}
