import { Module } from '@nestjs/common'
import { PositionsController } from './positions.controller.js'

@Module({ controllers: [PositionsController] })
export class PositionsModule {}
