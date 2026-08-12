import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import {
  JWT_IDENTITY,
  JWT_SECRET,
  type JwtIdentity,
} from '@/foundation/shared/runtime/runtime.module.js'
import { AuthService } from './auth.service.js'
import { JwtTokenCache, JWT_TOKEN_OPTIONS } from './auth-token-cache.js'
import { AuthController } from './auth.controller.js'

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (secret: string, identity: JwtIdentity) => ({
        secret,
        signOptions: {
          algorithm: 'HS256' as const,
          audience: identity.audience,
          issuer: identity.issuer,
        },
        verifyOptions: {
          algorithms: ['HS256' as const],
          audience: identity.audience,
          issuer: identity.issuer,
        },
      }),
      inject: [JWT_SECRET, JWT_IDENTITY],
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: JWT_TOKEN_OPTIONS,
      useValue: {},
    },
    JwtTokenCache,
    AuthService,
  ],
  exports: [AuthService, JwtTokenCache],
})
export class AuthModule {}
