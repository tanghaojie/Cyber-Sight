import { Module } from '@nestjs/common'
import { ApiLogsController } from './api-logs.controller.js'
import { ApiLogsRepository } from './api-logs.repository.js'

@Module({
  controllers: [ApiLogsController],
  providers: [ApiLogsRepository],
  exports: [ApiLogsRepository],
})
export class ApiLogsModule {}
