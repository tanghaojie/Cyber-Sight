import { buildApp } from './app.js'
import { runtimeConfig } from './config/runtime.config.js'

// 进程入口只负责读取环境、启动监听和记录启动失败，应用组装集中在 buildApp()。
const app = await buildApp(
  {},
  { jwtSecret: runtimeConfig.foundation.JWT_SECRET, closeDatabase: true },
)

try {
  await app.listen(runtimeConfig.foundation.PORT, runtimeConfig.foundation.HOST)
} catch (error) {
  app.getHttpAdapter().getInstance().log.error(error)
  process.exitCode = 1
}
