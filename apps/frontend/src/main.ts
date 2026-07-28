import { createApp } from 'vue'
import App from './App.vue'
import router from './router/index.js'
import { pinia } from './stores/pinia.js'
import { appConfig } from './config/app.config.js'
import 'virtual:svg-icons-register'
import './styles/main.scss'
import { registorHttpErrorHander } from './api/registorHttpErrorHander.js'

const app = createApp(App)
app.use(pinia)
app.use(router)

registorHttpErrorHander(router, pinia)

document.title = appConfig.name

app.mount('#app')
