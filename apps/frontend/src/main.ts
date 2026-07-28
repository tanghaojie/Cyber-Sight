import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index'
import { pinia } from './stores/pinia'
import { appConfig } from './config/app.config'
import 'virtual:svg-icons-register'
import './styles/main.scss'
import { registerHttpErrorHandler } from './bootstrap/registerHttpErrorHandler'

const app = createApp(App)
app.use(pinia)
app.use(router)

registerHttpErrorHandler(router, pinia)

document.title = appConfig.name

app.mount('#app')
