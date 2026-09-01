import { configurePlatform } from './foundation/platform/platform'
import { runtimeConfig } from './config/runtime.config'
import 'virtual:svg-icons-register'
import 'element-plus/theme-chalk/dark/css-vars.css'
import './foundation/styles/main.scss'

configurePlatform(runtimeConfig.platform)

void import('./geo-start').then(function start({ startGeoApplication }) {
  startGeoApplication()
})
