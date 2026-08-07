import { DynamicModule, Global, Module, type OnApplicationShutdown } from '@nestjs/common'
import { databaseClient, db, type Database } from '@/db/index.js'
import { DATABASE } from '@/shared/database/database.provider.js'

export const JWT_SECRET = Symbol('jwtSecret')

export interface RuntimeDependencies {
  jwtSecret: string
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
    return {
      module: RuntimeModule,
      providers: [
        { provide: DATABASE, useValue: dependencies.database ?? db },
        { provide: JWT_SECRET, useValue: dependencies.jwtSecret },
        {
          provide: DatabaseLifecycle,
          useValue: new DatabaseLifecycle(dependencies.closeDatabase ?? false),
        },
      ],
      exports: [DATABASE, JWT_SECRET],
    }
  }
}
