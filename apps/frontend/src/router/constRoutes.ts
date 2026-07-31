import { loginPage } from '@/modules/system/auth/auth.routes'
import { notFoundPage } from '@/modules/system/errors/error.routes'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { RouteRecordRaw, RouterView } from 'vue-router'
import HomePage from '@/modules/system/home/pages/HomePage.vue'

// 登录、首页和错误页是应用启动所需的最小静态路由，不依赖后端菜单配置。
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: loginPage,
    meta: {
      public: true,
      title: '登录',
      localizedTitle: { key: 'navigation.routes.login', fallback: '登录' },
    },
  },
  {
    path: '/404',
    name: 'not-found',
    component: notFoundPage,
    meta: {
      public: true,
      title: '页面未找到',
      localizedTitle: { key: 'navigation.routes.notFound', fallback: '页面未找到' },
    },
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin-root',
        component: HomePage,
        meta: {
          public: false,
          title: '首页',
          menuPath: '首页',
          localizedTitle: { key: 'navigation.routes.home', fallback: '首页' },
          localizedMenuPath: [{ key: 'navigation.routes.home', fallback: '首页' }],
        },
      },
    ],
  },
]

export default routes
