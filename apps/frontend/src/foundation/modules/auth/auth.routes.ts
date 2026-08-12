import type { RouteComponent } from 'vue-router'

// 静态登录路由使用懒加载，避免未进入登录页时提前加载页面样式和逻辑。
export const loginPage: RouteComponent = () => import('./pages/LoginPage.vue')
