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
import { requireCurrentUser } from '../auth/index.js'
import { ErrorCode } from '../../shared/errors/error-codes.js'
import {
  ensureUpdated,
  mutationResult,
  normalizedListQuery,
} from '../../shared/http/route-helpers.js'
import {
  failure,
  paginatedSuccess,
  success,
} from '../../shared/http/response.js'
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
  app.get<{ Querystring: ListQuery }>('/admin/menus', {
    schema: {
      operationId: 'listMenus', tags: ['Menus'], querystring: toFastifySchema(ListQuerySchema),
      response: { 200: toFastifySchema(MenuPageResultSchema), default: toFastifySchema(ErrorResponseSchema) },
    },
  }, async function listMenuHandler(request) {
    await requireCurrentUser(app, request)
    const page = await listMenus(app, normalizedListQuery(request.query))
    return paginatedSuccess(page.list, page.total)
  })

  app.get('/navigation/menus', {
    schema: {
      operationId: 'getCurrentNavigation', tags: ['Navigation'],
      response: { 200: toFastifySchema(NavigationMenuResponseSchema), default: toFastifySchema(ErrorResponseSchema) },
    },
  }, async function currentNavigationHandler(request) {
    const user = await requireCurrentUser(app, request)
    return success(await listNavigationMenus(app, user))
  })

  app.get('/admin/menus/tree', {
    schema: {
      operationId: 'listMenuTree', tags: ['Menus'],
      response: { 200: toFastifySchema(MenuListResponseSchema), default: toFastifySchema(ErrorResponseSchema) },
    },
  }, async function listMenuTreeHandler(request) {
    await requireCurrentUser(app, request)
    return success(await listAllMenus(app))
  })

  app.post<{ Body: MenuRequest }>('/admin/menus', {
    schema: {
      operationId: 'createMenu', tags: ['Menus'], body: toFastifySchema(MenuRequestSchema),
      response: { 200: toFastifySchema(MutationResultSchema), default: toFastifySchema(ErrorResponseSchema) },
    },
  }, async function createMenuHandler(request) {
    const actor = await requireCurrentUser(app, request)
    if (!isValidMenuPath(request.body)) {
      return failure(ErrorCode.INVALID_REQUEST, 'Root menu path must start with /')
    }
    if (!(await validateMenuParent(app, request.body.parentId))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Parent menu must be an existing directory')
    }
    return mutationResult(() => createMenu(app, request.body, actor.id))
  })

  app.put<{ Params: IdParams; Body: MenuRequest }>('/admin/menus/:id', {
    schema: {
      operationId: 'updateMenu', tags: ['Menus'], params: toFastifySchema(IdParamsSchema), body: toFastifySchema(MenuRequestSchema),
      response: { 200: toFastifySchema(MutationResultSchema), default: toFastifySchema(ErrorResponseSchema) },
    },
  }, async function updateMenuHandler(request) {
    const actor = await requireCurrentUser(app, request)
    if (!isValidMenuPath(request.body)) {
      return failure(ErrorCode.INVALID_REQUEST, 'Root menu path must start with /')
    }
    if (!(await validateMenuParent(app, request.body.parentId, request.params.id))) {
      return failure(ErrorCode.INVALID_REQUEST, 'Parent menu must be a directory outside the current subtree')
    }
    ensureUpdated(app, await updateMenu(app, request.params.id, request.body, actor.id))
    return success({ id: request.params.id })
  })

  app.delete<{ Params: IdParams }>('/admin/menus/:id', {
    schema: {
      operationId: 'deleteMenu', tags: ['Menus'], params: toFastifySchema(IdParamsSchema),
      response: { 200: toFastifySchema(EmptyResultSchema), default: toFastifySchema(ErrorResponseSchema) },
    },
  }, async function deleteMenuHandler(request) {
    const actor = await requireCurrentUser(app, request)
    if (await hasActiveMenuChildren(app, request.params.id)) {
      return failure(ErrorCode.RESOURCE_CONFLICT, 'Delete child menus before deleting this directory')
    }
    ensureUpdated(app, await softDeleteMenu(app, request.params.id, actor.id))
    return success()
  })
}
