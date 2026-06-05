import Fastify from 'fastify'
import sensible from '@fastify/sensible'
import { registerSwagger } from './plugins/swagger.js'
import dbPlugin from './plugins/db.js'
import { healthRoutes } from './modules/health/health.route.js'

const app = Fastify({ logger: true })

app.register(sensible)
await registerSwagger(app)
app.register(dbPlugin)
app.register(healthRoutes)

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
