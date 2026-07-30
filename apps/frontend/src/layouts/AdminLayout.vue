<template>
  <div class="app-shell">
    <!-- 窄屏时遮罩和侧栏共同形成抽屉；桌面端由 CSS 固定为双栏布局。 -->
    <button
      v-if="sidebarOpen"
      class="app-shell__scrim"
      type="button"
      aria-label="关闭菜单"
      @click="sidebarOpen = false"
    />
    <AppSidebar
      :items="navigation.items"
      :loading="navigation.loading"
      :open="sidebarOpen"
      @close="sidebarOpen = false"
      @navigate="sidebarOpen = false"
    />
    <section class="app-shell__content">
      <AppHeader
        :title="pageTitle"
        :menu-path="pageMenuPath"
        :display-name="auth.user?.displayName"
        :role="auth.user?.roles[0] ?? '管理员'"
        @open-menu="sidebarOpen = true"
        @logout="handleLogout"
      />
      <AppMain />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppMain from '@/components/layout/AppMain.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import { clearDynamicRoutes, installMenuRoutes } from '@/router/dynamicRoutes'
import { useAuthStore } from '@/modules/auth/auth.store'
import { useNavigationStore } from '@/modules/navigation/navigation.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const navigation = useNavigationStore()
const sidebarOpen = ref(false)
const pageTitle = computed(() => String(route.meta.title ?? '管理控制台'))
const pageMenuPath = computed(() => String(route.meta.menuPath ?? pageTitle.value))

watch(
  () => navigation.items,
  function refreshRoutes(items) {
    // 菜单被后台刷新后同步替换 Router 记录，不要求用户重新登录。
    if (navigation.loaded) {
      installMenuRoutes(router, items)
    }
  },
  { deep: true },
)

async function handleLogout() {
  // 退出顺序同时清理服务端会话、本地菜单和动态路由，再回到静态登录页。
  await auth.logout()
  navigation.clear()
  clearDynamicRoutes()
  await router.replace('/login')
}
</script>

<style lang="scss" scoped>
.app-shell {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--canvas);
}

.app-shell__scrim {
  position: fixed;
  inset: 0;
  z-index: 35;
  border: 0;
  background: rgba(9, 21, 16, 0.55);
  backdrop-filter: blur(2px);
}

.app-shell__content {
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;
}

@media (min-width: 1024px) {
  .app-shell {
    display: grid;
    grid-template-columns: 280px minmax(0, 1fr);
    align-items: start;
  }

  .app-shell__scrim {
    display: none;
  }

  .app-shell__content {
    grid-column: 2;
    grid-row: 1;
  }
}
</style>
