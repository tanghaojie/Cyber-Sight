import { DynamicModule, Module, type Type } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ApiLogsModule } from '@/modules/system/api-logs/api-logs.module.js'
import { AuthorizationGuard } from '@/modules/system/authorization/authorization.guard.js'
import { AuthorizationModule } from '@/modules/system/authorization/authorization.module.js'
import type { AuthorizationProvider } from '@/modules/system/authorization/authorization.provider.js'
import { DepartmentsModule } from '@/modules/system/departments/departments.module.js'
import { DictionariesModule } from '@/modules/system/dictionaries/dictionaries.module.js'
import { HealthModule } from '@/modules/system/health/health.module.js'
import { MenusModule } from '@/modules/system/menus/menus.module.js'
import { PositionsModule } from '@/modules/system/positions/positions.module.js'
import { RolesModule } from '@/modules/system/roles/roles.module.js'
import { UsersModule } from '@/modules/system/users/users.module.js'
import { ApiExceptionFilter } from '@/shared/http/api-exception.filter.js'
import { ContractResponseInterceptor } from '@/shared/http/contract.js'
import { RuntimeModule, type RuntimeDependencies } from '@/shared/runtime/runtime.module.js'

@Module({})
export class AppModule {
  static register(
    dependencies: RuntimeDependencies & {
      authorizationProvider?: AuthorizationProvider
      controllers?: Type<unknown>[]
    },
  ): DynamicModule {
    return {
      module: AppModule,
      imports: [
        RuntimeModule.register(dependencies),
        HealthModule,
        ApiLogsModule,
        AuthorizationModule.register(dependencies.authorizationProvider),
        UsersModule,
        RolesModule,
        DepartmentsModule,
        MenusModule,
        PositionsModule,
        DictionariesModule,
      ],
      providers: [
        { provide: APP_GUARD, useClass: AuthorizationGuard },
        { provide: APP_FILTER, useClass: ApiExceptionFilter },
        { provide: APP_INTERCEPTOR, useClass: ContractResponseInterceptor },
      ],
      controllers: dependencies.controllers ?? [],
    }
  }
}
