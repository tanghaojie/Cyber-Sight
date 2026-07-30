import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { databaseClient, db } from '@/db/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db
  }
}

// 数据库客户端与 Fastify 生命周期绑定，应用关闭时释放连接池。
async function closeDatabase(): Promise<void> {
  await databaseClient.end()
}

async function registerDatabase(app: FastifyInstance): Promise<void> {
  app.decorate('db', db)
  app.addHook('onClose', closeDatabase)
}

export default fp(registerDatabase)
