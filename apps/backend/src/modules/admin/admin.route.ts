import type { FastifyInstance } from 'fastify'
import type { components } from '@scaffold/openapi-spec'
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

type UserCreate = components['schemas']['UserCreateRequest']
type UserUpdate = components['schemas']['UserUpdateRequest']
type RoleRequest = components['schemas']['RoleRequest']
type MenuRequest = components['schemas']['MenuRequest']
type DictionaryRequest = components['schemas']['DictionaryRequest']

interface Querystring {
  pageNum?: number
  pageSize?: number
  keyword?: string
}

interface IdParams {
  id: number
}

const listQuerySchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    pageNum: { type: 'integer', minimum: 1, default: 1 },
    pageSize: { type: 'integer', minimum: 1, maximum: 100, default: 10 },
    keyword: { type: 'string', maxLength: 100 },
  },
} as const

const idParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'integer', minimum: 1 } },
} as const

const commonString = { type: 'string' } as const
const commonBoolean = { type: 'boolean' } as const
const commonInteger = { type: 'integer' } as const
const integerArray = { type: 'array', items: commonInteger } as const

const userCreateSchema = {
  type: 'object',
  required: ['username', 'displayName', 'email', 'password', 'enabled', 'roleIds'],
  additionalProperties: false,
  properties: {
    username: { type: 'string', minLength: 2, maxLength: 50 },
    displayName: { type: 'string', minLength: 1, maxLength: 80 },
    email: { type: 'string', format: 'email' },
    password: { type: 'string', minLength: 8, maxLength: 128 },
    enabled: commonBoolean,
    roleIds: integerArray,
  },
} as const

const userUpdateSchema = {
  ...userCreateSchema,
  required: ['displayName', 'email', 'enabled', 'roleIds'],
  properties: {
    displayName: userCreateSchema.properties.displayName,
    email: userCreateSchema.properties.email,
    password: userCreateSchema.properties.password,
    enabled: commonBoolean,
    roleIds: integerArray,
  },
} as const

const roleSchema = {
  type: 'object',
  required: ['name', 'code', 'description', 'enabled', 'menuIds'],
  additionalProperties: false,
  properties: {
    name: commonString,
    code: { type: 'string', pattern: '^[A-Z0-9_]+$' },
    description: commonString,
    enabled: commonBoolean,
    menuIds: integerArray,
  },
} as const

const menuSchema = {
  type: 'object',
  required: ['parentId', 'name', 'code', 'path', 'icon', 'sortOrder', 'type', 'enabled'],
  additionalProperties: false,
  properties: {
    parentId: commonInteger,
    name: commonString,
    code: commonString,
    path: commonString,
    icon: commonString,
    sortOrder: commonInteger,
    type: { type: 'string', enum: ['directory', 'menu', 'button'] },
    enabled: commonBoolean,
  },
} as const

const dictionarySchema = {
  type: 'object',
  required: ['type', 'label', 'value', 'sortOrder', 'enabled', 'remark'],
  additionalProperties: false,
  properties: {
    type: commonString,
    label: commonString,
    value: commonString,
    sortOrder: commonInteger,
    enabled: commonBoolean,
    remark: commonString,
  },
} as const

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === '23505'
  )
}

function listQuery(query: Querystring) {
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
  app.get<{ Querystring: Querystring }>(
    '/admin/users',
    {
      schema: { operationId: 'listUsers', summary: 'List users', tags: ['Users'], querystring: listQuerySchema },
    },
    async function listUserHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listUsers(app, listQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    }
  )
  app.post<{ Body: UserCreate }>(
    '/admin/users',
    { schema: { operationId: 'createUser', summary: 'Create a user', tags: ['Users'], body: userCreateSchema } },
    async function createUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createUser(app, request.body, actor.id))
    }
  )
  app.put<{ Params: IdParams; Body: UserUpdate }>(
    '/admin/users/:id',
    { schema: { operationId: 'updateUser', summary: 'Update a user', tags: ['Users'], params: idParamsSchema, body: userUpdateSchema } },
    async function updateUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      try {
        ensureUpdated(app, await updateUser(app, request.params.id, request.body, actor.id))
        return success({ id: request.params.id })
      } catch (error) {
        if (isUniqueViolation(error)) return failure(ErrorCode.RESOURCE_CONFLICT, 'Resource already exists')
        throw error
      }
    }
  )
  app.delete<{ Params: IdParams }>(
    '/admin/users/:id',
    { schema: { operationId: 'deleteUser', summary: 'Soft-delete a user', tags: ['Users'], params: idParamsSchema } },
    async function deleteUserHandler(request) {
      const actor = await requireCurrentUser(app, request)
      if (actor.id === request.params.id) throw app.httpErrors.forbidden('You cannot delete your own account')
      ensureUpdated(app, await softDeleteUser(app, request.params.id, actor.id))
      return success()
    }
  )

  app.get<{ Querystring: Querystring }>(
    '/admin/roles',
    { schema: { operationId: 'listRoles', summary: 'List roles', tags: ['Roles'], querystring: listQuerySchema } },
    async function listRoleHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listRoles(app, listQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    }
  )
  app.post<{ Body: RoleRequest }>(
    '/admin/roles',
    { schema: { operationId: 'createRole', summary: 'Create a role', tags: ['Roles'], body: roleSchema } },
    async function createRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createRole(app, request.body, actor.id))
    }
  )
  app.put<{ Params: IdParams; Body: RoleRequest }>(
    '/admin/roles/:id',
    { schema: { operationId: 'updateRole', summary: 'Update a role', tags: ['Roles'], params: idParamsSchema, body: roleSchema } },
    async function updateRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await updateRole(app, request.params.id, request.body, actor.id))
      return success({ id: request.params.id })
    }
  )
  app.delete<{ Params: IdParams }>(
    '/admin/roles/:id',
    { schema: { operationId: 'deleteRole', summary: 'Soft-delete a role', tags: ['Roles'], params: idParamsSchema } },
    async function deleteRoleHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await softDeleteRole(app, request.params.id, actor.id))
      return success()
    }
  )

  app.get<{ Querystring: Querystring }>(
    '/admin/menus',
    { schema: { operationId: 'listMenus', summary: 'List menus', tags: ['Menus'], querystring: listQuerySchema } },
    async function listMenuHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listMenus(app, listQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    }
  )
  app.post<{ Body: MenuRequest }>(
    '/admin/menus',
    { schema: { operationId: 'createMenu', summary: 'Create a menu', tags: ['Menus'], body: menuSchema } },
    async function createMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createMenu(app, request.body, actor.id))
    }
  )
  app.put<{ Params: IdParams; Body: MenuRequest }>(
    '/admin/menus/:id',
    { schema: { operationId: 'updateMenu', summary: 'Update a menu', tags: ['Menus'], params: idParamsSchema, body: menuSchema } },
    async function updateMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await updateMenu(app, request.params.id, request.body, actor.id))
      return success({ id: request.params.id })
    }
  )
  app.delete<{ Params: IdParams }>(
    '/admin/menus/:id',
    { schema: { operationId: 'deleteMenu', summary: 'Soft-delete a menu', tags: ['Menus'], params: idParamsSchema } },
    async function deleteMenuHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await softDeleteMenu(app, request.params.id, actor.id))
      return success()
    }
  )

  app.get<{ Querystring: Querystring }>(
    '/admin/dictionaries',
    { schema: { operationId: 'listDictionaries', summary: 'List dictionary entries', tags: ['Dictionaries'], querystring: listQuerySchema } },
    async function listDictionaryHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listDictionaries(app, listQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    }
  )
  app.post<{ Body: DictionaryRequest }>(
    '/admin/dictionaries',
    { schema: { operationId: 'createDictionary', summary: 'Create a dictionary entry', tags: ['Dictionaries'], body: dictionarySchema } },
    async function createDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createDictionary(app, request.body, actor.id))
    }
  )
  app.put<{ Params: IdParams; Body: DictionaryRequest }>(
    '/admin/dictionaries/:id',
    { schema: { operationId: 'updateDictionary', summary: 'Update a dictionary entry', tags: ['Dictionaries'], params: idParamsSchema, body: dictionarySchema } },
    async function updateDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await updateDictionary(app, request.params.id, request.body, actor.id))
      return success({ id: request.params.id })
    }
  )
  app.delete<{ Params: IdParams }>(
    '/admin/dictionaries/:id',
    { schema: { operationId: 'deleteDictionary', summary: 'Soft-delete a dictionary entry', tags: ['Dictionaries'], params: idParamsSchema } },
    async function deleteDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await softDeleteDictionary(app, request.params.id, actor.id))
      return success()
    }
  )
}
