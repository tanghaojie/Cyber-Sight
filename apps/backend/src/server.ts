import { buildApp } from './app.js'
import { env } from './config/env.js'

// 进程入口只负责读取环境、启动监听和记录启动失败，应用组装集中在 buildApp()。
const app = await buildApp({}, { jwtSecret: env.JWT_SECRET, closeDatabase: true })

try {
  await app.listen(env.PORT, env.HOST)
} catch (error) {
  app.getHttpAdapter().getInstance().log.error(error)
  process.exitCode = 1
}
