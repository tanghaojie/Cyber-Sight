import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { databaseClient, db } from '../db/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db
  }
}

async function closeDatabase(): Promise<void> {
  await databaseClient.end()
}

async function registerDatabase(app: FastifyInstance): Promise<void> {
  app.decorate('db', db)
  app.addHook('onClose', closeDatabase)
}

export default fp(registerDatabase)
