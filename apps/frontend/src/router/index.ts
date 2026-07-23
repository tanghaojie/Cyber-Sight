import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'
import { pinia } from '../stores/pinia.js'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { public: true },
    },
    {
      path: '/',
      component: () => import('../layouts/AdminLayout.vue'),
      children: [
        { path: '', name: 'home', component: () => import('../views/HomeView.vue'), meta: { title: '工作台总览', eyebrow: 'OVERVIEW / 01' } },
        { path: 'users', name: 'users', component: () => import('../views/admin/ResourceView.vue'), props: { resource: 'users' }, meta: { title: '用户管理', eyebrow: 'IDENTITY / 02' } },
        { path: 'roles', name: 'roles', component: () => import('../views/admin/ResourceView.vue'), props: { resource: 'roles' }, meta: { title: '角色管理', eyebrow: 'ACCESS / 03' } },
        { path: 'menus', name: 'menus', component: () => import('../views/admin/ResourceView.vue'), props: { resource: 'menus' }, meta: { title: '菜单管理', eyebrow: 'NAVIGATION / 04' } },
        { path: 'dictionaries', name: 'dictionaries', component: () => import('../views/admin/ResourceView.vue'), props: { resource: 'dictionaries' }, meta: { title: '字典管理', eyebrow: 'REFERENCE / 05' } },
      ],
    },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

router.beforeEach(async function authenticationGuard(to) {
  const auth = useAuthStore(pinia)
  if (to.meta.public) {
    if (to.name === 'login' && auth.isAuthenticated) return { name: 'home' }
    return true
  }
  await auth.fetchCurrentUser()
  if (!auth.isAuthenticated) return { name: 'login', query: { redirect: to.fullPath } }
  return true
})

export default router
