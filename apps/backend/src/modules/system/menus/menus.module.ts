import { Module } from '@nestjs/common'
import { MenusController } from './menus.controller.js'

@Module({ controllers: [MenusController] })
export class MenusModule {}
