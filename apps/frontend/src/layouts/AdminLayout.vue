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
      <TagView
        :tags="tagView.tags"
        :active-path="route.path"
        @navigate="handleTagNavigation"
        @close="handleCloseTag"
        @close-current="handleCloseCurrent"
        @close-others="handleCloseOthers"
        @close-all="handleCloseAll"
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
import TagView from '@/modules/system/tag-view/TagView.vue'
import { clearDynamicRoutes, installMenuRoutes } from '@/router/dynamicRoutes'
import { useAuthStore } from '@/modules/system/auth/auth.store'
import { useNavigationStore } from '@/modules/system/navigation/navigation.store'
import { useTagViewStore } from '@/modules/system/tag-view/tag-view.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const navigation = useNavigationStore()
const tagView = useTagViewStore()
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

watch(
  () => auth.user?.id,
  function activateTagHistory(userId) {
    if (typeof userId === 'number') {
      tagView.activate(userId)
      syncCurrentTag()
    } else {
      tagView.deactivate()
    }
  },
  { immediate: true },
)

watch(
  [() => route.path, () => pageTitle.value],
  function syncRouteTag() {
    syncCurrentTag()
  },
  { immediate: true },
)

function syncCurrentTag(): void {
  if (!auth.user) {
    return
  }
  tagView.open({ path: route.path, title: pageTitle.value })
}

async function handleTagNavigation(path: string): Promise<void> {
  if (path !== route.path) {
    await router.push(path)
  }
}

async function handleCloseTag(path: string): Promise<void> {
  const fallback = tagView.close(path)
  if (path !== route.path) {
    return
  }

  const targetPath = fallback?.path ?? '/'
  if (targetPath !== route.path) {
    await router.push(targetPath)
  }
  // 首页关闭或重复导航不会触发路由 watcher，需要主动恢复当前页标签。
  syncCurrentTag()
}

async function handleCloseCurrent(): Promise<void> {
  await handleCloseTag(route.path)
}

function handleCloseOthers(): void {
  tagView.closeOthers(route.path)
}

async function handleCloseAll(): Promise<void> {
  tagView.closeAll()
  if (route.path !== '/') {
    await router.push('/')
  }
  syncCurrentTag()
}

async function handleLogout(): Promise<void> {
  // 退出顺序同时清理服务端会话、本地菜单和动态路由，再回到静态登录页。
  await auth.logout()
  tagView.deactivate()
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
