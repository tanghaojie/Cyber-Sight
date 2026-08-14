import { DynamicModule, Module, type Type } from '@nestjs/common'
import { FoundationModule } from '@/foundation/foundation.module.js'
import type { AuthorizationProvider } from '@/foundation/modules/authorization/authorization.provider.js'
import type { RuntimeDependencies } from '@/foundation/shared/runtime/runtime.module.js'
import { PlatformModule } from '@/platform/platform.module.js'

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
      imports: [FoundationModule.register(dependencies), PlatformModule],
    }
  }
}
