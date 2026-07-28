import type { FastifyInstance } from 'fastify'
import {
  EmptyResultSchema, ErrorResponseSchema, IdParamsSchema, ListQuerySchema, MutationResultSchema,
  RolePageResultSchema, RoleRequestSchema, toFastifySchema,
  type IdParams, type ListQuery, type RoleRequest,
} from '@scaffold/api-contract'
import { requireCurrentUser, revokeAllTokens } from '../auth/auth.service.js'
import { ensureUpdated, mutationResult, normalizedListQuery } from '../../shared/http/route-helpers.js'
import { paginatedSuccess, success } from '../../shared/http/response.js'
import { createRole, listRoles, softDeleteRole, updateRole } from './roles.repository.js'

export async function roleRoutes(app: FastifyInstance): Promise<void> {
  app.get<{ Querystring: ListQuery }>('/admin/roles', {
    schema: { operationId: 'listRoles', tags: ['Roles'], querystring: toFastifySchema(ListQuerySchema), response: { 200: toFastifySchema(RolePageResultSchema), default: toFastifySchema(ErrorResponseSchema) } },
  }, async function listRoleHandler(request) {
    await requireCurrentUser(app, request)
    const page = await listRoles(app, normalizedListQuery(request.query))
    return paginatedSuccess(page.list, page.total)
  })
  app.post<{ Body: RoleRequest }>('/admin/roles', {
    schema: { operationId: 'createRole', tags: ['Roles'], body: toFastifySchema(RoleRequestSchema), response: { 200: toFastifySchema(MutationResultSchema), default: toFastifySchema(ErrorResponseSchema) } },
  }, async function createRoleHandler(request) {
    const actor = await requireCurrentUser(app, request)
    return mutationResult(() => createRole(app, request.body, actor.id))
  })
  app.put<{ Params: IdParams; Body: RoleRequest }>('/admin/roles/:id', {
    schema: { operationId: 'updateRole', tags: ['Roles'], params: toFastifySchema(IdParamsSchema), body: toFastifySchema(RoleRequestSchema), response: { 200: toFastifySchema(MutationResultSchema), default: toFastifySchema(ErrorResponseSchema) } },
  }, async function updateRoleHandler(request) {
    const actor = await requireCurrentUser(app, request)
    ensureUpdated(app, await updateRole(app, request.params.id, request.body, actor.id))
    revokeAllTokens(app)
    return success({ id: request.params.id })
  })
  app.delete<{ Params: IdParams }>('/admin/roles/:id', {
    schema: { operationId: 'deleteRole', tags: ['Roles'], params: toFastifySchema(IdParamsSchema), response: { 200: toFastifySchema(EmptyResultSchema), default: toFastifySchema(ErrorResponseSchema) } },
  }, async function deleteRoleHandler(request) {
    const actor = await requireCurrentUser(app, request)
    ensureUpdated(app, await softDeleteRole(app, request.params.id, actor.id))
    revokeAllTokens(app)
    return success()
  })
}
