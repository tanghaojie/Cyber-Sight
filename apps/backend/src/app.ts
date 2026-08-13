import { randomBytes } from 'node:crypto'
import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import type { Type } from '@nestjs/common'
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import type { FastifyServerOptions } from 'fastify'
import { AppModule } from './app.module.js'
import { runtimeConfig } from './config/runtime.config.js'
import { databaseClient, db } from './database.js'
import {
  createApiLogWriter,
  registerApiLogHooks,
} from './foundation/modules/api-logs/api-logs.hooks.js'
import type { AuthorizationProvider } from './foundation/modules/authorization/authorization.provider.js'
import { ApiLogsRepository } from './foundation/modules/api-logs/api-logs.repository.js'
import type { ApiLogWriter } from './foundation/modules/api-logs/api-logs.service.js'
import type { Database } from './foundation/database/index.js'

export interface AppDependencies {
  jwtSecret?: string
  database?: Database
  closeDatabase?: boolean
  authorizationProvider?: AuthorizationProvider
  apiLogWriter?: ApiLogWriter
  controllers?: Type<unknown>[]
}

function registerSwagger(app: NestFastifyApplication): void {
  const config = new DocumentBuilder()
    .setTitle(runtimeConfig.platform.API_TITLE)
    .setVersion(runtimeConfig.platform.API_VERSION)
    .setDescription(runtimeConfig.platform.API_DESCRIPTION)
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
      jwtIdentity: {
        audience: runtimeConfig.platform.JWT_AUDIENCE,
        issuer: runtimeConfig.platform.JWT_ISSUER,
      },
      authorizationProvider: dependencies.authorizationProvider,
      // 完整运行时 Schema 是 Foundation 数据库端口的超集；组合根在此收窄注入类型。
      database: (dependencies.database ?? db) as Database,
      closeDatabase: dependencies.closeDatabase
        ? async function closeDatabase(): Promise<void> {
            await databaseClient.end()
          }
        : undefined,
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
    dependencies.apiLogWriter ?? createApiLogWriter(fastify, app.get(ApiLogsRepository)),
  )
  await app.init()
  registerSwagger(app)
  await fastify.ready()
  return app
}
