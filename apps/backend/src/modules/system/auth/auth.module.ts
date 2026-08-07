import { Global, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { JWT_SECRET } from '@/shared/runtime/runtime.module.js'
import { AuthService } from './auth.service.js'
import { JwtTokenCache, JWT_TOKEN_OPTIONS } from './auth-token-cache.js'
import { AuthController } from './auth.controller.js'

@Global()
@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (secret: string) => ({
        secret,
        signOptions: {
          algorithm: 'HS256' as const,
          audience: 'cyber-ai-forge-api',
          issuer: 'cyber-ai-forge',
        },
        verifyOptions: {
          algorithms: ['HS256' as const],
          audience: 'cyber-ai-forge-api',
          issuer: 'cyber-ai-forge',
        },
      }),
      inject: [JWT_SECRET],
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
