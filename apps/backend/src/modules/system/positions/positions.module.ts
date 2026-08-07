import { Module } from '@nestjs/common'
import { DepartmentsModule } from '@/modules/system/departments/departments.module.js'
import { PositionsController } from './positions.controller.js'
import { PositionsAccess } from './positions.access.js'
import { PositionsRepository } from './positions.repository.js'
import { PositionsService } from './positions.service.js'

@Module({
  imports: [DepartmentsModule],
  controllers: [PositionsController],
  providers: [PositionsAccess, PositionsRepository, PositionsService],
  exports: [PositionsAccess, PositionsRepository, PositionsService],
})
export class PositionsModule {}
