import type { FastifyInstance } from 'fastify'
import {
  CurrentUserResponseSchema,
  EmptySuccessResponseSchema,
  ErrorResponseSchema,
  LoginRequestSchema,
  LoginResultSchema,
  type LoginRequest,
} from '@scaffold/api-contract'
import { ErrorCode } from '../../shared/errors/error-codes.js'
import { failure, success } from '../../shared/http/response.js'
import {
  authenticateCredentials,
  requireCurrentUser,
  revokeCurrentSession,
} from './auth.service.js'

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: LoginRequest }>(
    '/auth/login',
    {
      schema: {
        operationId: 'login',
        summary: 'Sign in with username and password',
        tags: ['Authentication'],
        body: LoginRequestSchema,
        response: {
          200: LoginResultSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function login(request, reply) {
      const user = await authenticateCredentials(
        app,
        request.body.username,
        request.body.password,
        reply
      )
      if (!user) {
        return failure(
          ErrorCode.INVALID_CREDENTIALS,
          'Incorrect username or password'
        )
      }
      return success(user)
    }
  )

  app.get(
    '/auth/me',
    {
      schema: {
        operationId: 'getCurrentUser',
        summary: 'Get the signed-in user',
        tags: ['Authentication'],
        response: {
          200: CurrentUserResponseSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function getCurrentUser(request) {
      return success(await requireCurrentUser(app, request))
    }
  )

  app.post(
    '/auth/logout',
    {
      schema: {
        operationId: 'logout',
        summary: 'Revoke the current session',
        tags: ['Authentication'],
        response: {
          200: EmptySuccessResponseSchema,
          default: ErrorResponseSchema,
        },
      },
    },
    async function logout(request, reply) {
      const user = await requireCurrentUser(app, request)
      await revokeCurrentSession(app, request, reply, user.id)
      return success()
    }
  )
}
