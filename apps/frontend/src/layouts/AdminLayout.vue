<template>
  <div class="admin-shell" :class="{ 'sidebar-open': sidebarOpen }">
    <button v-if="sidebarOpen" class="mobile-scrim" aria-label="关闭菜单" @click="sidebarOpen = false" />
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark"><span></span><span></span><span></span></div>
        <div><strong>NOVA</strong><small>ADMIN CONSOLE</small></div>
      </div>
      <div class="nav-label">工作台</div>
      <nav>
        <RouterLink v-for="item in navigation" :key="item.to" :to="item.to" class="nav-item" @click="sidebarOpen = false">
          <AppIcon :name="item.icon" />
          <span>{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="sidebar-foot">
        <div class="environment"><span></span><div><b>系统运行正常</b><small>Production ready</small></div></div>
      </div>
    </aside>

    <section class="workspace">
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" aria-label="打开菜单" @click="sidebarOpen = true"><AppIcon name="panel" /></button>
          <div><div class="eyebrow">NOVA MANAGEMENT</div><h1>{{ route.meta.title }}</h1></div>
        </div>
        <div class="account">
          <div class="avatar">{{ initials }}</div>
          <div class="account-copy"><strong>{{ auth.user?.displayName }}</strong><small>{{ auth.user?.roles[0] ?? '管理员' }}</small></div>
          <button class="logout-button" title="退出登录" aria-label="退出登录" @click="handleLogout"><AppIcon name="logout" /></button>
        </div>
      </header>
      <main class="content"><RouterView /></main>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppIcon from '../components/AppIcon.vue'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(false)
const initials = computed(() => auth.user?.displayName.slice(0, 1).toUpperCase() ?? 'A')
const navigation = [
  { to: '/', label: '首页', icon: 'home' },
  { to: '/users', label: '用户管理', icon: 'users' },
  { to: '/roles', label: '角色管理', icon: 'shield' },
  { to: '/menus', label: '菜单管理', icon: 'menu' },
  { to: '/dictionaries', label: '字典管理', icon: 'book' },
]

async function handleLogout() {
  await auth.logout()
  await router.replace('/login')
}
</script>

<style scoped>
.admin-shell { min-height: 100vh; display: grid; grid-template-columns: 252px minmax(0, 1fr); }
.sidebar { position: sticky; top: 0; z-index: 20; height: 100vh; display: flex; flex-direction: column; padding: 26px 18px 20px; color: #dfe3f1; background: linear-gradient(180deg, #181b2b 0%, #121522 100%); border-right: 1px solid rgba(255,255,255,.045); }
.brand { height: 50px; display: flex; align-items: center; gap: 12px; padding: 0 10px; }
.brand strong { display: block; color: #fff; font-size: 18px; letter-spacing: .14em; line-height: 1; }
.brand small { display: block; margin-top: 6px; color: #70788d; font-size: 9px; letter-spacing: .17em; }
.brand-mark { width: 34px; height: 34px; position: relative; display: grid; place-items: center; border-radius: 10px; background: linear-gradient(145deg, #7777ef, #4b4bb6); box-shadow: 0 8px 20px rgba(91,91,214,.32); transform: rotate(-7deg); }
.brand-mark span { position: absolute; width: 16px; height: 2px; background: #fff; border-radius: 2px; }
.brand-mark span:first-child { transform: translateY(-5px); width: 10px; }
.brand-mark span:last-child { transform: translateY(5px); width: 12px; }
.nav-label { margin: 32px 12px 10px; color: #656d82; font-size: 10px; font-weight: 750; letter-spacing: .16em; }
nav { display: grid; gap: 5px; }
.nav-item { position: relative; display: flex; align-items: center; gap: 13px; min-height: 46px; padding: 0 14px; border-radius: 11px; color: #8e96aa; font-size: 14px; font-weight: 620; transition: 160ms ease; }
.nav-item:hover { color: #e7e9f4; background: rgba(255,255,255,.045); }
.nav-item.router-link-exact-active { color: #fff; background: linear-gradient(90deg, rgba(102,102,224,.28), rgba(89,89,195,.12)); }
.nav-item.router-link-exact-active::before { position: absolute; left: -18px; width: 3px; height: 24px; border-radius: 0 3px 3px 0; background: #7b7bf1; content: ""; box-shadow: 0 0 12px #6f6fe3; }
.nav-item.router-link-exact-active .icon { color: #8888f0; }
.sidebar-foot { margin-top: auto; }
.environment { display: flex; align-items: center; gap: 11px; padding: 14px; border: 1px solid rgba(255,255,255,.06); border-radius: 12px; background: rgba(255,255,255,.025); }
.environment > span { width: 8px; height: 8px; border-radius: 50%; background: #32c48d; box-shadow: 0 0 0 4px rgba(50,196,141,.1); }
.environment b, .environment small { display: block; }
.environment b { color: #aab0bf; font-size: 11px; }.environment small { margin-top: 3px; color: #555d70; font-size: 9px; }
.workspace { min-width: 0; }
.topbar { height: 86px; display: flex; align-items: center; justify-content: space-between; gap: 20px; padding: 0 36px; background: rgba(255,255,255,.92); border-bottom: 1px solid var(--line); backdrop-filter: blur(16px); }
.topbar-left { display: flex; align-items: center; gap: 14px; }
.eyebrow { margin-bottom: 3px; color: #9aa1b1; font-size: 9px; font-weight: 800; letter-spacing: .16em; }
h1 { margin: 0; color: #21283a; font-size: 20px; font-weight: 750; }
.menu-toggle { display: none; border: 0; padding: 8px; color: #596176; background: transparent; }
.account { display: flex; align-items: center; gap: 11px; }
.avatar { width: 38px; height: 38px; display: grid; place-items: center; border-radius: 11px; color: #fff; background: linear-gradient(145deg, #7474e8, #5656c2); font-size: 14px; font-weight: 750; box-shadow: 0 8px 18px rgba(80,80,185,.18); }
.account-copy strong, .account-copy small { display: block; }.account-copy strong { font-size: 13px; }.account-copy small { margin-top: 3px; color: #9299a8; font-size: 10px; }
.logout-button { width: 36px; height: 36px; display: grid; place-items: center; margin-left: 6px; border: 1px solid var(--line); border-radius: 10px; color: #8d95a6; background: #fff; transition: 160ms; }.logout-button:hover { color: var(--danger); border-color: #f0cbd1; background: #fff5f6; }
.content { min-height: calc(100vh - 86px); padding: 30px 36px 40px; }
.mobile-scrim { display: none; }
@media (max-width: 900px) {
  .admin-shell { grid-template-columns: 1fr; }
  .sidebar { position: fixed; left: 0; transform: translateX(-102%); width: 252px; transition: transform 220ms ease; }
  .sidebar-open .sidebar { transform: translateX(0); }
  .mobile-scrim { position: fixed; inset: 0; z-index: 19; display: block; border: 0; background: rgba(10,12,20,.45); backdrop-filter: blur(2px); }
  .menu-toggle { display: grid; }
}
@media (max-width: 600px) {
  .topbar { height: 74px; padding: 0 17px; }.content { min-height: calc(100vh - 74px); padding: 20px 16px 30px; }
  .eyebrow, .account-copy { display: none; }.account { gap: 4px; }h1 { font-size: 18px; }
}
</style>
