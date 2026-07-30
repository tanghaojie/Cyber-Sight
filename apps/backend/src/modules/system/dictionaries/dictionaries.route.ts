import type { FastifyInstance } from 'fastify'
import {
  DictionaryPageResultSchema,
  DictionaryRequestSchema,
  EmptyResultSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  ListQuerySchema,
  MutationResultSchema,
  toFastifySchema,
  type DictionaryRequest,
  type IdParams,
  type ListQuery,
} from '@scaffold/api-contract'
import { requireCurrentUser } from '@/modules/system/auth/auth.service.js'
import { authorizationPermissionKeys } from '@/modules/system/authorization/authorization.resources.js'
import { ensureUpdated, mutationResult, normalizedListQuery } from '@/shared/http/route-helpers.js'
import { paginatedSuccess, success } from '@/shared/http/response.js'
import {
  createDictionary,
  listDictionaries,
  softDeleteDictionary,
  updateDictionary,
} from './dictionaries.repository.js'

/** 字典管理路由复用通用分页、唯一冲突和软删除响应约定。 */
export async function dictionaryRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ListQuery }>(
    '/admin/dictionaries',
    {
      config: {
        authorization: {
          mode: 'permission',
          anyOf: [authorizationPermissionKeys.dictionariesManage],
        },
      },
      schema: {
        operationId: 'listDictionaries',
        tags: ['Dictionaries'],
        querystring: toFastifySchema(ListQuerySchema),
        response: {
          200: toFastifySchema(DictionaryPageResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listDictionaryHandler(request) {
      await requireCurrentUser(app, request)
      const page = await listDictionaries(app, normalizedListQuery(request.query))
      return paginatedSuccess(page.list, page.total)
    },
  )
  app.post<{ Body: DictionaryRequest }>(
    '/admin/dictionaries',
    {
      config: {
        authorization: {
          mode: 'permission',
          anyOf: [authorizationPermissionKeys.dictionariesManage],
        },
      },
      schema: {
        operationId: 'createDictionary',
        tags: ['Dictionaries'],
        body: toFastifySchema(DictionaryRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function createDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      return mutationResult(() => createDictionary(app, request.body, actor.id))
    },
  )
  app.put<{ Params: IdParams; Body: DictionaryRequest }>(
    '/admin/dictionaries/:id',
    {
      config: {
        authorization: {
          mode: 'permission',
          anyOf: [authorizationPermissionKeys.dictionariesManage],
        },
      },
      schema: {
        operationId: 'updateDictionary',
        tags: ['Dictionaries'],
        params: toFastifySchema(IdParamsSchema),
        body: toFastifySchema(DictionaryRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function updateDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await updateDictionary(app, request.params.id, request.body, actor.id))
      return success({ id: request.params.id })
    },
  )
  app.delete<{ Params: IdParams }>(
    '/admin/dictionaries/:id',
    {
      config: {
        authorization: {
          mode: 'permission',
          anyOf: [authorizationPermissionKeys.dictionariesManage],
        },
      },
      schema: {
        operationId: 'deleteDictionary',
        tags: ['Dictionaries'],
        params: toFastifySchema(IdParamsSchema),
        response: {
          200: toFastifySchema(EmptyResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function deleteDictionaryHandler(request) {
      const actor = await requireCurrentUser(app, request)
      ensureUpdated(app, await softDeleteDictionary(app, request.params.id, actor.id))
      return success()
    },
  )
}
