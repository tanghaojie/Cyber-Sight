import { Module } from '@nestjs/common'
import { AuthorizationController } from './authorization.controller.js'

@Module({ controllers: [AuthorizationController] })
export class AuthorizationModule {}
