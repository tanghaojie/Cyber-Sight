import { createRouter, createWebHistory } from 'vue-router'

function loadHomeView() {
  return import('../views/HomeView.vue')
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: loadHomeView,
    },
  ],
})

export default router
