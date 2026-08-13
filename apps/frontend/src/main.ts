import { configurePlatform } from './foundation/platform/platform'
import { runtimeConfig } from './config/runtime.config'

// Platform 配置必须先于 Foundation 模块求值，确保存储命名空间和初始语言读取当前平台配置。
configurePlatform(runtimeConfig.platform)

void import('./start').then(function start({ startApplication }) {
  startApplication()
})
