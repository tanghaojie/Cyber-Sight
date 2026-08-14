import { Module } from '@nestjs/common'
import { MenusController } from './menus.controller.js'
import { MenusRepository } from './menus.repository.js'

@Module({
  controllers: [MenusController],
  providers: [MenusRepository],
  exports: [MenusRepository],
})
export class MenusModule {}
