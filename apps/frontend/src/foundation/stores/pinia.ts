import { createPinia } from 'pinia'

// 全应用共享同一 Pinia 实例，路由守卫也会在组件挂载前直接使用它。
export const pinia = createPinia()
