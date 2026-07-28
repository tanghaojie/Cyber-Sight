import { buildApp } from './app.js'
import { env } from './config/env.js'

const app = await buildApp({}, { jwtSecret: env.JWT_SECRET })

try {
  await app.listen({
    port: env.PORT,
    host: env.HOST,
  })
} catch (error) {
  app.log.error(error)
  process.exitCode = 1
}
