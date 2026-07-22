import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import { databaseClient, db } from '../db/index.js'

declare module 'fastify' {
  interface FastifyInstance {
    db: typeof db
  }
}

export default fp(async (app: FastifyInstance) => {
  app.decorate('db', db)

  app.addHook('onClose', async () => {
    await databaseClient.end()
  })
})
