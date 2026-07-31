import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { pinia } from './stores/pinia'
import { appConfig } from './config/app.config'
import 'virtual:svg-icons-register'
import './styles/main.scss'
import { registerHttpErrorHandler } from './bootstrap/registerHttpErrorHandler'

// 前端组合根：先安装状态和路由，再注册依赖两者的全局 HTTP 错误副作用。
const app = createApp(App)
app.use(pinia)
app.use(router)

registerHttpErrorHandler(router, pinia)

document.title = `${appConfig.name} · ${appConfig.productLabel}`

app.mount('#app')
