import {
  CanActivate,
  createParamDecorator,
  ExecutionContext,
  Inject,
  Injectable,
  SetMetadata,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import type { CurrentUser } from '@cyber-ai-forge/api-contract'
import type { FastifyRequest } from 'fastify'
import { AuthService } from '@/modules/system/auth/auth.service.js'
import { forbidden, internalError } from '@/shared/errors/http-errors.js'
import type { AuthorizationProvider } from './authorization.provider.js'

export const authorizationProviderToken = Symbol('authorizationProvider')
export const routeAuthorizationKey = Symbol('routeAuthorization')

export type RouteAuthorization =
  { mode: 'public' } | { mode: 'authenticated' } | { mode: 'permission'; anyOf: string[] }

interface AuthorizedRequest extends FastifyRequest {
  accessUser?: CurrentUser
}

export function Public() {
  return SetMetadata(routeAuthorizationKey, { mode: 'public' } satisfies RouteAuthorization)
}

export function Authenticated() {
  return SetMetadata(routeAuthorizationKey, { mode: 'authenticated' } satisfies RouteAuthorization)
}

export function RequirePermissions(...anyOf: string[]) {
  return SetMetadata(routeAuthorizationKey, {
    mode: 'permission',
    anyOf,
  } satisfies RouteAuthorization)
}

export const CurrentAccessUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentUser => {
    const request = context.switchToHttp().getRequest<AuthorizedRequest>()
    if (!request.accessUser) {
      throw internalError('Authorization guard did not provide an access user')
    }
    return request.accessUser
  },
)

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(
    @Inject(Reflector) private readonly reflector: Reflector,
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(authorizationProviderToken)
    private readonly provider: AuthorizationProvider,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authorization = this.reflector.get<RouteAuthorization>(
      routeAuthorizationKey,
      context.getHandler(),
    )
    if (!authorization) {
      throw internalError('Route authorization metadata is required')
    }
    if (authorization.mode === 'public') {
      return true
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>()
    const user = await this.authService.requireCurrentUser(request.headers.authorization)
    request.accessUser = user

    if (
      authorization.mode === 'permission' &&
      !(await this.provider.effectivePermissionKeys(user)).some((key) =>
        authorization.anyOf.includes(key),
      )
    ) {
      throw forbidden()
    }
    return true
  }
}
