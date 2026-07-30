import { loginPage } from '@/modules/auth/auth.routes'
import { notFoundPage } from '@/modules/errors/error.routes'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { RouteRecordRaw, RouterView } from 'vue-router'
import HomePage from '@/modules/home/pages/HomePage.vue'

const routes: RouteRecordRaw[] = [
  { path: '/login', name: 'login', component: loginPage, meta: { public: true, title: '登录' } },
  {
    path: '/404',
    name: 'not-found',
    component: notFoundPage,
    meta: { public: true, title: '页面未找到' },
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin-root',
        component: HomePage,
        meta: { public: false, title: '首页', menuPath: '首页' },
      },
    ],
  },
]

export default routes
