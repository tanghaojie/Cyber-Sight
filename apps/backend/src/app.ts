import { randomBytes } from 'node:crypto'
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { Type } from '@nestjs/common'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { FastifyServerOptions } from 'fastify'
import { AppModule } from './app.module.js'
import {
  createApiLogWriter,
  registerApiLogHooks,
} from './modules/system/api-logs/api-logs.hooks.js'
import type { ApiLogWriter } from './modules/system/api-logs/api-logs.service.js'
import { BackendRuntime } from './shared/runtime/backend-runtime.js'
import type { RuntimeDependencies } from './shared/runtime/runtime.module.js'

export interface AppDependencies extends Partial<Omit<RuntimeDependencies, 'jwtSecret'>> {
  jwtSecret?: string
  apiLogWriter?: ApiLogWriter
  controllers?: Type<unknown>[]
}

function registerSwagger(app: NestFastifyApplication): void {
  const config = new DocumentBuilder()
    .setTitle('Cyber AI Forge API')
    .setVersion('0.1.0')
    .setDescription('CYBER management scaffold — runtime-safe, modular, and AI-native')
    .addBearerAuth(undefined, 'bearerAuth')
    .addSecurityRequirements('bearerAuth')
    .build()
  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('/docs', app, document, {
    jsonDocumentUrl: '/docs/json',
  })
}

/** 创建可通过 Fastify inject 验证的 Nest 应用，不占用真实端口。 */
export async function buildApp(
  options: FastifyServerOptions = {},
  dependencies: AppDependencies = {},
): Promise<NestFastifyApplication> {
  const jwtSecret = dependencies.jwtSecret ?? randomBytes(32).toString('base64url')
  const adapter = new FastifyAdapter({ logger: true, ...options })
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register({
      jwtSecret,
      authorizationProvider: dependencies.authorizationProvider,
      database: dependencies.database,
      closeDatabase: dependencies.closeDatabase,
      controllers: dependencies.controllers,
    }),
    adapter,
    {
      logger: options.logger === false ? false : ['log', 'error', 'warn'],
      abortOnError: false,
    },
  )
  app.enableShutdownHooks()
  const fastify = app.getHttpAdapter().getInstance()
  registerApiLogHooks(
    fastify,
    dependencies.apiLogWriter ?? createApiLogWriter(fastify, app.get(BackendRuntime)),
  )
  await app.init()
  registerSwagger(app)
  await fastify.ready()
  return app
}
