import type { FastifyInstance } from 'fastify'
import {
  DataResourceListResultSchema,
  ErrorResponseSchema,
  IdParamsSchema,
  MutationResultSchema,
  PermissionListResultSchema,
  SubjectAccessRequestSchema,
  SubjectAccessResultSchema,
  toFastifySchema,
  type AuthorizationSubjectType,
  type IdParams,
  type SubjectAccessRequest,
} from '@scaffold/api-contract'
import {
  invalidateAllTokenCache,
  invalidateUserTokenCache,
} from '@/modules/system/auth/auth.service.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { failure, success } from '@/shared/http/response.js'
import { dataResourceDefinitions, authorizationPermissionKeys } from './authorization.resources.js'
import {
  authorizationSubjectExists,
  getSubjectAccess,
  listPermissions,
  replaceSubjectAccess,
} from './authorization.service.js'

const accessAdministrationPermissions = [
  authorizationPermissionKeys.usersManage,
  authorizationPermissionKeys.rolesManage,
  authorizationPermissionKeys.departmentsManage,
  authorizationPermissionKeys.menusManage,
]

// 三类授权主体复用同一组 GET/PUT 路由，只在路径、权限键和操作名上区分。
function subjectPath(subjectType: AuthorizationSubjectType): string {
  return `/admin/authorization/${subjectType}s/:id`
}

function subjectPermission(subjectType: AuthorizationSubjectType): string {
  switch (subjectType) {
    case 'user':
      return authorizationPermissionKeys.usersManage
    case 'role':
      return authorizationPermissionKeys.rolesManage
    case 'department':
      return authorizationPermissionKeys.departmentsManage
  }
}

function subjectName(subjectType: AuthorizationSubjectType): string {
  return `${subjectType[0].toUpperCase()}${subjectType.slice(1)}`
}

function registerSubjectRoutes(app: FastifyInstance, subjectType: AuthorizationSubjectType): void {
  const path = subjectPath(subjectType)
  const permission = subjectPermission(subjectType)
  const name = subjectName(subjectType)
  app.get<{ Params: IdParams }>(
    path,
    {
      config: { authorization: { mode: 'permission', anyOf: [permission] } },
      schema: {
        operationId: `get${name}Access`,
        tags: ['Authorization'],
        params: toFastifySchema(IdParamsSchema),
        response: {
          200: toFastifySchema(SubjectAccessResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function getAccessHandler(request) {
      if (!(await authorizationSubjectExists(app, subjectType, request.params.id))) {
        throw app.httpErrors.notFound('Resource not found')
      }
      return success(await getSubjectAccess(app, subjectType, request.params.id))
    },
  )
  app.put<{ Params: IdParams; Body: SubjectAccessRequest }>(
    path,
    {
      config: { authorization: { mode: 'permission', anyOf: [permission] } },
      schema: {
        operationId: `replace${name}Access`,
        tags: ['Authorization'],
        params: toFastifySchema(IdParamsSchema),
        body: toFastifySchema(SubjectAccessRequestSchema),
        response: {
          200: toFastifySchema(MutationResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function replaceAccessHandler(request) {
      if (!(await authorizationSubjectExists(app, subjectType, request.params.id))) {
        throw app.httpErrors.notFound('Resource not found')
      }
      const actor = request.accessUser!
      if (
        !(await replaceSubjectAccess(app, subjectType, request.params.id, request.body, actor.id))
      ) {
        return failure(ErrorCode.INVALID_REQUEST, 'Invalid permission or data policy')
      }
      if (subjectType === 'user') {
        // 用户直接策略只影响本人；角色或部门策略可能影响多名用户，因此清空全部身份快照。
        invalidateUserTokenCache(app, request.params.id)
      } else {
        invalidateAllTokenCache(app)
      }
      return success({ id: request.params.id })
    },
  )
}

export async function authorizationRoutes(app: FastifyInstance): Promise<void> {
  // 任一授权管理权限都可读取目录，编辑具体主体仍由其对应权限单独控制。
  app.get(
    '/admin/authorization/permissions',
    {
      config: {
        authorization: { mode: 'permission', anyOf: accessAdministrationPermissions },
      },
      schema: {
        operationId: 'listAuthorizationPermissions',
        tags: ['Authorization'],
        response: {
          200: toFastifySchema(PermissionListResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listPermissionHandler() {
      return success(await listPermissions(app))
    },
  )
  app.get(
    '/admin/authorization/data-resources',
    {
      config: {
        authorization: { mode: 'permission', anyOf: accessAdministrationPermissions },
      },
      schema: {
        operationId: 'listAuthorizationDataResources',
        tags: ['Authorization'],
        response: {
          200: toFastifySchema(DataResourceListResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function listDataResourceHandler() {
      return success(dataResourceDefinitions)
    },
  )
  registerSubjectRoutes(app, 'user')
  registerSubjectRoutes(app, 'role')
  registerSubjectRoutes(app, 'department')
}
