import { Module } from '@nestjs/common'
import { AuthModule } from '@/foundation/modules/auth/auth.module.js'
import { DepartmentsModule } from '@/foundation/modules/departments/departments.module.js'
import { PositionsModule } from '@/foundation/modules/positions/positions.module.js'
import { RolesModule } from '@/foundation/modules/roles/roles.module.js'
import { UsersController } from './users.controller.js'
import { UsersAccess } from './users.access.js'
import { UsersRepository } from './users.repository.js'

@Module({
  imports: [AuthModule, DepartmentsModule, PositionsModule, RolesModule],
  controllers: [UsersController],
  providers: [UsersAccess, UsersRepository],
  exports: [UsersAccess, UsersRepository],
})
export class UsersModule {}
