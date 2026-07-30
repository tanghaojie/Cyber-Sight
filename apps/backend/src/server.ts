import { buildApp } from './app.js'
import { env } from './config/env.js'

// 进程入口只负责读取环境、启动监听和记录启动失败，应用组装集中在 buildApp()。
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
