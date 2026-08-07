import { Module } from '@nestjs/common'
import { AuthModule } from '@/modules/system/auth/auth.module.js'
import { DepartmentsModule } from '@/modules/system/departments/departments.module.js'
import { PositionsModule } from '@/modules/system/positions/positions.module.js'
import { RolesModule } from '@/modules/system/roles/roles.module.js'
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
