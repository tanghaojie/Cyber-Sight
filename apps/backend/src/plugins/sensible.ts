import type { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

export default fp(async (_app: FastifyInstance) => {
  // sensible is registered in app.ts directly
})
