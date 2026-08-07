import { DynamicModule, Global, Module } from '@nestjs/common'
import { DepartmentsModule } from '@/modules/system/departments/departments.module.js'
import { AuthModule } from '@/modules/system/auth/auth.module.js'
import { RolesModule } from '@/modules/system/roles/roles.module.js'
import { UsersModule } from '@/modules/system/users/users.module.js'
import { AuthorizationController } from './authorization.controller.js'
import { authorizationProviderToken } from './authorization.guard.js'
import { AuthorizationReferences } from './authorization.references.js'
import type { AuthorizationProvider } from './authorization.provider.js'
import { AuthorizationService } from './authorization.service.js'
import { LocalAuthorizationProvider } from './authorization.provider.js'

@Global()
@Module({
  imports: [AuthModule, DepartmentsModule, RolesModule, UsersModule],
  controllers: [AuthorizationController],
  providers: [AuthorizationService, AuthorizationReferences, LocalAuthorizationProvider],
  exports: [AuthorizationService, AuthorizationReferences, LocalAuthorizationProvider],
})
export class AuthorizationModule {
  static register(authorizationProvider?: AuthorizationProvider): DynamicModule {
    return {
      module: AuthorizationModule,
      providers: [
        {
          provide: authorizationProviderToken,
          inject: [LocalAuthorizationProvider],
          useFactory: (localProvider: LocalAuthorizationProvider) =>
            authorizationProvider ?? localProvider,
        },
      ],
      exports: [authorizationProviderToken],
    }
  }
}
