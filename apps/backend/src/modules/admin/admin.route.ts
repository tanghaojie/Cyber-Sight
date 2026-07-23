import type { FastifyInstance } from 'fastify'
import {
  DictionaryPageResultSchema as DictionaryPageResultZodSchema,
  DictionaryRequestSchema as DictionaryRequestZodSchema,
  EmptyResultSchema as EmptyResultZodSchema,
  ErrorResponseSchema as ErrorResponseZodSchema,
  IdParamsSchema as IdParamsZodSchema,
  ListQuerySchema as ListQueryZodSchema,
  MenuPageResultSchema as MenuPageResultZodSchema,
  MenuRequestSchema as MenuRequestZodSchema,
  MutationResultSchema as MutationResultZodSchema,
  RolePageResultSchema as RolePageResultZodSchema,
  RoleRequestSchema as RoleRequestZodSchema,
  toFastifySchema,
  UserCreateSchema as UserCreateZodSchema,
  UserPageResultSchema as UserPageResultZodSchema,
  UserUpdateSchema as UserUpdateZodSchema,
  type DictionaryRequest,
  type IdParams,
  type ListQuery,
  type MenuRequest,
  type RoleRequest,
  type UserCreate,
  type UserUpdate,
} from '@scaffold/api-contract'
import { ErrorCode } from '../../shared/errors/error-codes.js'
import {
  failure,
  normalizePagination,
  paginatedSuccess,
  success,
} from '../../shared/http/response.js'
import { requireCurrentUser } from '../auth/auth.service.js'
import {
  createDictionary,
  createMenu,
  createRole,
  createUser,
  listDictionaries,
  listMenus,
  listRoles,
  listUsers,
  softDeleteDictionary,
  softDeleteMenu,
  softDeleteRole,
  softDeleteUser,
  updateDictionary,
  updateMenu,
  updateRole,
  updateUser,
} from './admin.repository.js'

const DictionaryPageResultSchema = toFastifySchema(
  DictionaryPageResultZodSchema
)
const DictionaryRequestSchema = toFastifySchema(DictionaryRequestZodSchema)
const EmptyResultSchema = toFastifySchema(EmptyResultZodSchema)
const ErrorResponseSchema = toFastifySchema(ErrorResponseZodSchema)
const IdParamsSchema = toFastifySchema(IdParamsZodSchema)
const ListQuerySchema = toFastifySchema(ListQueryZodSchema)
const MenuPageResultSchema = toFastifySchema(MenuPageResultZodSchema)
const MenuRequestSchema = toFastifySchema(MenuRequestZodSchema)
const MutationResultSchema = toFastifySchema(MutationResultZodSchema)
const RolePageResultSchema = toFastifySchema(RolePageResultZodSchema)
const RoleRequestSchema = toFastifySchema(RoleRequestZodSchema)
const UserCreateSchema = toFastifySchema(UserCreateZodSchema)
const UserPageResultSchema = toFastifySchema(UserPageResultZodSchema)
const UserUpdateSchema = toFastifySchema(UserUpdateZodSchema)

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  )
}

function normalizedListQuery(query: ListQuery) {
  return { ...normalizePagination(query), keyword: query.keyword }
}

async function mutationResult(operation: () => Promise<number>) {
  try {
    return success({ id: await operation() })
  } catch (error) {
    if (isUniqueViolation(error)) {
      return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
    }
    throw error
  }
}

function ensureUpdated(app: FastifyInstance, updated: boolean): void {
  if (!updated) {
    throw app.httpErrors.notFound('Resource not found')
  }
}

export async function adminRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ListQuery }>(
    '/admin/users',
    {
      schema: {
        operationId: 'listUsers',
        summary: 'List users',
        tags: ['Users'],
        querystring: ListQuerySchema,
        response: {
          200: UserPageResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function listUserHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listUsers(app, normalizedListQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    }
  )

  app.post<{ Body: UserCreate }>(
    '/admin/users',
    {
      schema: {
        operationId: 'createUser',
        summary: 'Create a user',
        tags: ['Users'],
        body: UserCreateSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function createUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createUser(app, request.body, actor.id))
    }
  )

  app.put<{ Params: IdParams; Body: UserUpdate }>(
    '/admin/users/:id',
    {
      schema: {
        operationId: 'updateUser',
        summary: 'Update a user',
        tags: ['Users'],
        params: IdParamsSchema,
        body: UserUpdateSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function updateUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      try {
        ensureUpdated(
          app,
          await updateUser(app, request.params.id, request.body, actor.id)
        )
        return success({ id: request.params.id })
      } catch (error) {
        if (isUniqueViolation(error)) {
          return failure(
            ErrorCode.RESOURCE_CONFLICT,
            'Resource already exists'
          )
        }
        throw error
      }
    }
  )

  app.delete<{ Params: IdParams }>(
    '/admin/users/:id',
    {
      schema: {
        operationId: 'deleteUser',
        summary: 'Soft-delete a user',
        tags: ['Users'],
        params: IdParamsSchema,
        response: {
          200: EmptyResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function deleteUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (actor.id === request.params.id) {
        throw app.httpErrors.forbidden('You cannot delete your own account')
      }
      ensureUpdated(app, await softDeleteUser(app, request.params.id, actor.id))
      return success()
    }
  )

  app.get<{ Querystring: ListQuery }>(
    '/admin/roles',
    {
      schema: {
        operationId: 'listRoles',
        summary: 'List roles',
        tags: ['Roles'],
        querystring: ListQuerySchema,
        response: {
          200: RolePageResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function listRoleHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listRoles(app, normalizedListQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    }
  )

  app.post<{ Body: RoleRequest }>(
    '/admin/roles',
    {
      schema: {
        operationId: 'createRole',
        summary: 'Create a role',
        tags: ['Roles'],
        body: RoleRequestSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function createRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createRole(app, request.body, actor.id))
    }
  )

  app.put<{ Params: IdParams; Body: RoleRequest }>(
    '/admin/roles/:id',
    {
      schema: {
        operationId: 'updateRole',
        summary: 'Update a role',
        tags: ['Roles'],
        params: IdParamsSchema,
        body: RoleRequestSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function updateRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(
        app,
        await updateRole(app, request.params.id, request.body, actor.id)
      )
      return success({ id: request.params.id })
    }
  )

  app.delete<{ Params: IdParams }>(
    '/admin/roles/:id',
    {
      schema: {
        operationId: 'deleteRole',
        summary: 'Soft-delete a role',
        tags: ['Roles'],
        params: IdParamsSchema,
        response: {
          200: EmptyResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function deleteRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await softDeleteRole(app, request.params.id, actor.id))
      return success()
    }
  )

  app.get<{ Querystring: ListQuery }>(
    '/admin/menus',
    {
      schema: {
        operationId: 'listMenus',
        summary: 'List menus',
        tags: ['Menus'],
        querystring: ListQuerySchema,
        response: {
          200: MenuPageResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function listMenuHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listMenus(app, normalizedListQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    }
  )

  app.post<{ Body: MenuRequest }>(
    '/admin/menus',
    {
      schema: {
        operationId: 'createMenu',
        summary: 'Create a menu',
        tags: ['Menus'],
        body: MenuRequestSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function createMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createMenu(app, request.body, actor.id))
    }
  )

  app.put<{ Params: IdParams; Body: MenuRequest }>(
    '/admin/menus/:id',
    {
      schema: {
        operationId: 'updateMenu',
        summary: 'Update a menu',
        tags: ['Menus'],
        params: IdParamsSchema,
        body: MenuRequestSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function updateMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(
        app,
        await updateMenu(app, request.params.id, request.body, actor.id)
      )
      return success({ id: request.params.id })
    }
  )

  app.delete<{ Params: IdParams }>(
    '/admin/menus/:id',
    {
      schema: {
        operationId: 'deleteMenu',
        summary: 'Soft-delete a menu',
        tags: ['Menus'],
        params: IdParamsSchema,
        response: {
          200: EmptyResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function deleteMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await softDeleteMenu(app, request.params.id, actor.id))
      return success()
    }
  )

  app.get<{ Querystring: ListQuery }>(
    '/admin/dictionaries',
    {
      schema: {
        operationId: 'listDictionaries',
        summary: 'List dictionary entries',
        tags: ['Dictionaries'],
        querystring: ListQuerySchema,
        response: {
          200: DictionaryPageResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function listDictionaryHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listDictionaries(
        app,
        normalizedListQuery(request.query)
      )
      return paginatedSuccess(page.list, page.total)
    }
  )

  app.post<{ Body: DictionaryRequest }>(
    '/admin/dictionaries',
    {
      schema: {
        operationId: 'createDictionary',
        summary: 'Create a dictionary entry',
        tags: ['Dictionaries'],
        body: DictionaryRequestSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function createDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() =>
        createDictionary(app, request.body, actor.id)
      )
    }
  )

  app.put<{ Params: IdParams; Body: DictionaryRequest }>(
    '/admin/dictionaries/:id',
    {
      schema: {
        operationId: 'updateDictionary',
        summary: 'Update a dictionary entry',
        tags: ['Dictionaries'],
        params: IdParamsSchema,
        body: DictionaryRequestSchema,
        response: {
          200: MutationResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function updateDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(
        app,
        await updateDictionary(app, request.params.id, request.body, actor.id)
      )
      return success({ id: request.params.id })
    }
  )

  app.delete<{ Params: IdParams }>(
    '/admin/dictionaries/:id',
    {
      schema: {
        operationId: 'deleteDictionary',
        summary: 'Soft-delete a dictionary entry',
        tags: ['Dictionaries'],
        params: IdParamsSchema,
        response: {
          200: EmptyResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function deleteDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(
        app,
        await softDeleteDictionary(app, request.params.id, actor.id)
      )
      return success()
    }
  )
}
