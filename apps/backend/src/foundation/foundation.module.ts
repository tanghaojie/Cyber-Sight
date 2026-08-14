import { DynamicModule, Module, type Type } from '@nestjs/common'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { ApiLogsModule } from '@/foundation/modules/api-logs/api-logs.module.js'
import { AuthorizationGuard } from '@/foundation/modules/authorization/authorization.guard.js'
import { AuthorizationModule } from '@/foundation/modules/authorization/authorization.module.js'
import type { AuthorizationProvider } from '@/foundation/modules/authorization/authorization.provider.js'
import { DepartmentsModule } from '@/foundation/modules/departments/departments.module.js'
import { DictionariesModule } from '@/foundation/modules/dictionaries/dictionaries.module.js'
import { HealthModule } from '@/foundation/modules/health/health.module.js'
import { MenusModule } from '@/foundation/modules/menus/menus.module.js'
import { PositionsModule } from '@/foundation/modules/positions/positions.module.js'
import { RolesModule } from '@/foundation/modules/roles/roles.module.js'
import { UsersModule } from '@/foundation/modules/users/users.module.js'
import { ApiExceptionFilter } from '@/foundation/shared/http/api-exception.filter.js'
import { ContractResponseInterceptor } from '@/foundation/shared/http/contract.js'
import {
  RuntimeModule,
  type RuntimeDependencies,
} from '@/foundation/shared/runtime/runtime.module.js'

@Module({})
export class FoundationModule {
  static register(
    dependencies: RuntimeDependencies & {
      authorizationProvider?: AuthorizationProvider
      controllers?: Type<unknown>[]
    },
  ): DynamicModule {
    return {
      module: FoundationModule,
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
