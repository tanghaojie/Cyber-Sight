import type { FastifyInstance } from 'fastify'
import {
  CurrentUserResponseSchema,
  EmptySuccessResponseSchema,
  ErrorResponseSchema,
  LoginRequestSchema,
  LoginResultSchema,
  toFastifySchema,
  type LoginRequest,
} from '@scaffold/api-contract'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { failure, success } from '@/shared/http/response.js'
import { authenticateCredentials, requireCurrentUser, revokeCurrentToken } from './auth.service.js'

const bearerSecurity = [{ bearerAuth: [] }]

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: LoginRequest }>(
    '/auth/login',
    {
      schema: {
        operationId: 'login',
        summary: 'Sign in with username and password',
        tags: ['Authentication'],
        security: [],
        body: toFastifySchema(LoginRequestSchema),
        response: {
          200: toFastifySchema(LoginResultSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function login(request) {
      const loginData = await authenticateCredentials(
        app,
        request.body.username,
        request.body.password,
      )
      if (!loginData) {
        return failure(ErrorCode.INVALID_CREDENTIALS, 'Incorrect username or password')
      }
      return success(loginData)
    },
  )

  app.get(
    '/auth/me',
    {
      schema: {
        operationId: 'getCurrentUser',
        summary: 'Get the signed-in user',
        tags: ['Authentication'],
        security: bearerSecurity,
        response: {
          200: toFastifySchema(CurrentUserResponseSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function getCurrentUser(request) {
      return success(await requireCurrentUser(app, request))
    },
  )

  app.post(
    '/auth/logout',
    {
      schema: {
        operationId: 'logout',
        summary: 'Revoke the current token',
        tags: ['Authentication'],
        security: bearerSecurity,
        response: {
          200: toFastifySchema(EmptySuccessResponseSchema),
          default: toFastifySchema(ErrorResponseSchema),
        },
      },
    },
    async function logout(request) {
      const user = await requireCurrentUser(app, request)
      await revokeCurrentToken(app, request, user.id)
      return success()
    },
  )
}
