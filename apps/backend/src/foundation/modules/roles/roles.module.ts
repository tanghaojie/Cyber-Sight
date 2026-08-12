import { Module } from '@nestjs/common'
import { AuthModule } from '@/foundation/modules/auth/auth.module.js'
import { RolesController } from './roles.controller.js'
import { RolesAccess } from './roles.access.js'
import { RolesRepository } from './roles.repository.js'

@Module({
  imports: [AuthModule],
  controllers: [RolesController],
  providers: [RolesAccess, RolesRepository],
  exports: [RolesAccess, RolesRepository],
})
export class RolesModule {}
