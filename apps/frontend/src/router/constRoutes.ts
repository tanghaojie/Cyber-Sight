import { loginPage } from '@/modules/system/auth/auth.routes'
import { noAccessPage, notFoundPage } from '@/modules/system/errors/error.routes'
import AdminLayout from '@/layouts/AdminLayout.vue'
import { RouteRecordRaw } from 'vue-router'
import { personalProfilePage } from '@/modules/system/users/profile.routes'

// 登录、错误页和个人资料是应用启动所需的最小静态路由；首页由动态菜单决定。
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
    path: '/403',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'no-access',
        component: noAccessPage,
        meta: {
          public: false,
          title: '暂无访问权限',
          menuPath: '暂无访问权限',
          localizedTitle: { key: 'errors.noAccess.title', fallback: '暂无访问权限' },
          localizedMenuPath: [{ key: 'errors.noAccess.title', fallback: '暂无访问权限' }],
        },
      },
    ],
  },
  {
    path: '/profile',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'personal-profile',
        component: personalProfilePage,
        meta: {
          public: false,
          title: '个人资料',
          menuPath: '个人资料',
          localizedTitle: { key: 'users.views.profile', fallback: '个人资料' },
          localizedMenuPath: [{ key: 'users.views.profile', fallback: '个人资料' }],
        },
      },
    ],
  },
]

export default routes
