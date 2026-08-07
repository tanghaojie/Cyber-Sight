import { Module } from '@nestjs/common'
import { ApiLogsController } from './api-logs.controller.js'

@Module({ controllers: [ApiLogsController] })
export class ApiLogsModule {}
