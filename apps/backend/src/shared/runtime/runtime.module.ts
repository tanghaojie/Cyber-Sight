import { DynamicModule, Global, Module, type OnApplicationShutdown } from '@nestjs/common'
import { databaseClient, db, type Database } from '@/db/index.js'
import { JwtTokenCache } from '@/modules/system/auth/auth-token-cache.js'
import { authorizationProviderToken } from '@/modules/system/authorization/authorization.guard.js'
import {
  LocalAuthorizationProvider,
  type AuthorizationProvider,
} from '@/modules/system/authorization/authorization.provider.js'
import { BackendRuntime } from './backend-runtime.js'

export interface RuntimeDependencies {
  jwtSecret: string
  authorizationProvider?: AuthorizationProvider
  database?: Database
  closeDatabase?: boolean
}

class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(private readonly enabled: boolean) {}

  async onApplicationShutdown(): Promise<void> {
    if (this.enabled) {
      await databaseClient.end()
    }
  }
}

@Global()
@Module({})
export class RuntimeModule {
  static register(dependencies: RuntimeDependencies): DynamicModule {
    const authorizationProvider =
      dependencies.authorizationProvider ?? new LocalAuthorizationProvider()
    const runtime = new BackendRuntime(
      dependencies.database ?? db,
      new JwtTokenCache(dependencies.jwtSecret),
      authorizationProvider,
    )
    return {
      module: RuntimeModule,
      providers: [
        { provide: BackendRuntime, useValue: runtime },
        {
          provide: authorizationProviderToken,
          useValue: authorizationProvider,
        },
        {
          provide: DatabaseLifecycle,
          useValue: new DatabaseLifecycle(dependencies.closeDatabase ?? false),
        },
      ],
      exports: [BackendRuntime, authorizationProviderToken],
    }
  }
}
