import { Body, Controller, Get, Inject, Post, Req } from '@nestjs/common'
import {
  CurrentUserResponseSchema,
  EmptySuccessResponseSchema,
  LoginRequestSchema,
  LoginResultSchema,
  type CurrentUser,
  type LoginRequest,
} from '@cyber-ai-forge/api-contract'
import type { FastifyRequest } from 'fastify'
import {
  Authenticated,
  CurrentAccessUser,
  Public,
} from '@/modules/system/authorization/authorization.guard.js'
import { ErrorCode } from '@/shared/errors/error-codes.js'
import { ContractRoute } from '@/shared/http/contract.js'
import { failure, success } from '@/shared/http/response.js'
import { ZodValidationPipe } from '@/shared/http/zod-validation.pipe.js'
import { AuthService } from './auth.service.js'

@Controller()
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('/auth/login')
  @Public()
  @ContractRoute({
    operationId: 'login',
    summary: 'Sign in with username and password',
    tags: ['Authentication'],
    body: LoginRequestSchema,
    response: LoginResultSchema,
    public: true,
  })
  async login(@Body(new ZodValidationPipe(LoginRequestSchema)) body: LoginRequest) {
    const loginData = await this.authService.authenticateCredentials(body.username, body.password)
    return loginData
      ? success(loginData)
      : failure(ErrorCode.INVALID_CREDENTIALS, 'Incorrect username or password')
  }

  @Get('/auth/me')
  @Authenticated()
  @ContractRoute({
    operationId: 'getCurrentUser',
    summary: 'Get the signed-in user',
    tags: ['Authentication'],
    response: CurrentUserResponseSchema,
  })
  getCurrentUser(@CurrentAccessUser() user: CurrentUser) {
    return success(user)
  }

  @Post('/auth/logout')
  @Authenticated()
  @ContractRoute({
    operationId: 'logout',
    summary: 'Revoke the current token',
    tags: ['Authentication'],
    response: EmptySuccessResponseSchema,
  })
  async logout(@Req() request: FastifyRequest, @CurrentAccessUser() user: CurrentUser) {
    await this.authService.revokeCurrentToken(request.headers.authorization, user.id)
    return success()
  }
}
