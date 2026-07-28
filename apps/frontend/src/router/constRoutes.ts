import { RouterView } from 'vue-router'
import { loginPage } from '@/modules/auth/auth.routes'
import { notFoundPage } from '@/modules/errors/error.routes'

const routes = [
  { path: '/login', name: 'login', component: loginPage, meta: { public: true, title: '登录' } },
  {
    path: '/404',
    name: 'not-found',
    component: notFoundPage,
    meta: { public: true, title: '页面未找到' },
  },
  { path: '/', name: 'admin-root', component: RouterView, children: [] },
]

export default routes
