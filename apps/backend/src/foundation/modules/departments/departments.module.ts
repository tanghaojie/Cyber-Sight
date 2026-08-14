import { Module } from '@nestjs/common'
import { DepartmentsController } from './departments.controller.js'
import { DepartmentsAccess } from './departments.access.js'
import { DepartmentsRepository } from './departments.repository.js'

@Module({
  controllers: [DepartmentsController],
  providers: [DepartmentsAccess, DepartmentsRepository],
  exports: [DepartmentsAccess, DepartmentsRepository],
})
export class DepartmentsModule {}
