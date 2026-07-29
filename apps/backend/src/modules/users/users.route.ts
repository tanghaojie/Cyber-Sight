import type { FastifyInstance } from 'fastify'
import {
  EmptyResultSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  ListQuerySchema,
  MutationResultSchema,
  toFastifySchema,
  UserCreateSchema,
  UserPageResultSchema,
  UserUpdateSchema,
  type IdParams,
  type ListQuery,
  type UserCreate,
  type UserUpdate,
} from '@scaffold/api-contract'
import {
  invalidateUserTokenCache,
  requireCurrentUser,
  revokeUserTokens,
} from '@/modules/auth/auth.service.js'
import {
  ensureUpdated,
  isUniqueViolation,
  mutationResult,
  normalizedListQuery,
} from '@/shared/http/route-helpers.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { failure, paginatedSuccess, success } from '@/shared/http/response.js'
import { createUser, listUsers, softDeleteUser, updateUser } from './users.repository.js'

export async function userRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ListQuery }>(
    '/admin/users',
    {
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
      await requireCurrentUser(app, request)
      const page = await listUsers(app, normalizedListQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    },
  )

  app.post<{ Body: UserCreate }>(
    '/admin/users',
    {
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
      return mutationResult(() => createUser(app, request.body, actor.id))
    },
  )

  app.put<{ Params: IdParams; Body: UserUpdate }>(
    '/admin/users/:id',
    {
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
      try {
        ensureUpdated(app, await updateUser(app, request.params.id, request.body, actor.id))
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
        throw app.httpErrors.forbidden('You cannot delete your own account')
      }
      ensureUpdated(app, await softDeleteUser(app, request.params.id, actor.id))
      await revokeUserTokens(app, request.params.id, actor.id)
      return success()
    },
  )
}
