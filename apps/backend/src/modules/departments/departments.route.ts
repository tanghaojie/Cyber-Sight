import type { FastifyInstance } from 'fastify'
import {
  DepartmentListResultSchema,
  DepartmentOptionListResultSchema,
  DepartmentRequestSchema,
  EmptyResultSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  MutationResultSchema,
  toFastifySchema,
  type DepartmentRequest,
  type IdParams,
} from '@scaffold/api-contract'
import { authorizationPermissionKeys } from '@/modules/authorization/authorization.resources.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { ensureUpdated, mutationResult } from '@/shared/http/route-helpers.js'
import { failure, success } from '@/shared/http/response.js'
import {
  canDeleteDepartment,
  createDepartment,
  listDepartmentOptions,
  listDepartments,
  softDeleteDepartment,
  updateDepartment,
  validateDepartmentParent,
} from './departments.repository.js'

const departmentPermission = {
  authorization: {
    mode: 'permission' as const,
    anyOf: [authorizationPermissionKeys.departmentsManage],
  },
}

export async function departmentRoutes(app: FastifyInstance): Promise<void> {
  app.get(
    '/admin/departments',
    {
      config: departmentPermission,
      schema: {
        operationId: 'listDepartments',
        tags: ['Departments'],
        response: {
          200: toFastifySchema(DepartmentListResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listDepartmentHandler() {
      return success(await listDepartments(app))
    },
  )
  app.get(
    '/admin/departments/options',
    {
      config: {
        authorization: {
          mode: 'permission',
          anyOf: [
            authorizationPermissionKeys.departmentsManage,
            authorizationPermissionKeys.usersManage,
            authorizationPermissionKeys.rolesManage,
          ],
        },
      },
      schema: {
        operationId: 'listDepartmentOptions',
        tags: ['Departments'],
        response: {
          200: toFastifySchema(DepartmentOptionListResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listDepartmentOptionHandler() {
      return success(await listDepartmentOptions(app))
    },
  )
  app.post<{ Body: DepartmentRequest }>(
    '/admin/departments',
    {
      config: departmentPermission,
      schema: {
        operationId: 'createDepartment',
        tags: ['Departments'],
        body: toFastifySchema(DepartmentRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function createDepartmentHandler(request) {
      if (!(await validateDepartmentParent(app, request.body.parentId))) {
        return failure(ErrorCode.INVALID_REQUEST, 'Invalid parent department')
      }
      return mutationResult(() => createDepartment(app, request.body, request.accessUser!.id))
    },
  )
  app.put<{ Params: IdParams; Body: DepartmentRequest }>(
    '/admin/departments/:id',
    {
      config: departmentPermission,
      schema: {
        operationId: 'updateDepartment',
        tags: ['Departments'],
        params: toFastifySchema(IdParamsSchema),
        body: toFastifySchema(DepartmentRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function updateDepartmentHandler(request) {
      if (!(await validateDepartmentParent(app, request.body.parentId, request.params.id))) {
        return failure(ErrorCode.INVALID_REQUEST, 'Invalid parent department')
      }
      ensureUpdated(
        app,
        await updateDepartment(app, request.params.id, request.body, request.accessUser!.id),
      )
      return success({ id: request.params.id })
    },
  )
  app.delete<{ Params: IdParams }>(
    '/admin/departments/:id',
    {
      config: departmentPermission,
      schema: {
        operationId: 'deleteDepartment',
        tags: ['Departments'],
        params: toFastifySchema(IdParamsSchema),
        response: {
          200: toFastifySchema(EmptyResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function deleteDepartmentHandler(request) {
      if (!(await canDeleteDepartment(app, request.params.id))) {
        return failure(
          ErrorCode.RESOURCE_CONFLICT,
          'Department still has child departments, active users or policy references',
        )
      }
      ensureUpdated(app, await softDeleteDepartment(app, request.params.id, request.accessUser!.id))
      return success()
    },
  )
}
