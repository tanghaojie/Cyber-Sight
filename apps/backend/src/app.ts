import Fastify from 'fastify'
import sensible from '@fastify/sensible'

const app = Fastify({ logger: true })

app.register(sensible)

app.get('/ping', async () => ({ pong: true }))

const start = async () => {
  try {
    await app.listen({ port: 3000, host: '0.0.0.0' })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
