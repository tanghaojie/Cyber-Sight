import { DynamicModule, Global, Module, type OnApplicationShutdown } from '@nestjs/common'
import type { Database } from '@/foundation/database/index.js'
import { DATABASE } from '@/foundation/shared/database/database.provider.js'

export const JWT_SECRET = Symbol('jwtSecret')
export const JWT_IDENTITY = Symbol('jwtIdentity')

export interface JwtIdentity {
  audience: string
  issuer: string
}

export interface RuntimeDependencies {
  jwtSecret: string
  database: Database
  closeDatabase?: () => Promise<void>
  jwtIdentity: JwtIdentity
}

class DatabaseLifecycle implements OnApplicationShutdown {
  constructor(private readonly closeDatabase?: () => Promise<void>) {}

  async onApplicationShutdown(): Promise<void> {
    await this.closeDatabase?.()
  }
}

@Global()
@Module({})
export class RuntimeModule {
  static register(dependencies: RuntimeDependencies): DynamicModule {
    return {
      module: RuntimeModule,
      providers: [
        { provide: DATABASE, useValue: dependencies.database },
        { provide: JWT_SECRET, useValue: dependencies.jwtSecret },
        { provide: JWT_IDENTITY, useValue: dependencies.jwtIdentity },
        {
          provide: DatabaseLifecycle,
          useValue: new DatabaseLifecycle(dependencies.closeDatabase),
        },
      ],
      exports: [DATABASE, JWT_SECRET, JWT_IDENTITY],
    }
  }
}
