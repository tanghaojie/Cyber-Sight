import type { FastifyInstance } from 'fastify'
import type { components } from '@scaffold/openapi-spec'
import { ErrorCode } from '../../shared/errors/error-codes.js'
import { failure, success } from '../../shared/http/response.js'
import {
  authenticateCredentials,
  requireCurrentUser,
  revokeCurrentSession,
} from './auth.service.js'

type LoginRequest = components['schemas']['LoginRequest']

const loginBodySchema = {
  type: 'object',
  required: ['username', 'password'],
  additionalProperties: false,
  properties: {
    username: { type: 'string', minLength: 2, maxLength: 50 },
    password: { type: 'string', minLength: 8, maxLength: 128 },
  },
} as const

export async function authRoutes(app: FastifyInstance): Promise<void> {
  app.post<{ Body: LoginRequest }>(
    '/auth/login',
    {
      schema: {
        operationId: 'login',
        summary: 'Sign in with username and password',
        tags: ['Authentication'],
        body: loginBodySchema,
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
      },
    },
    async function logout(request, reply) {
      const user = await requireCurrentUser(app, request)
      await revokeCurrentSession(app, request, reply, user.id)
      return success()
    }
  )
}
