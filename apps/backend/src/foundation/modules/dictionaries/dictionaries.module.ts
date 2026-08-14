import { Module } from '@nestjs/common'
import { DictionariesController } from './dictionaries.controller.js'
import { DictionariesRepository } from './dictionaries.repository.js'

@Module({
  controllers: [DictionariesController],
  providers: [DictionariesRepository],
  exports: [DictionariesRepository],
})
export class DictionariesModule {}
