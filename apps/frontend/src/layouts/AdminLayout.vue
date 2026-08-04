<template>
  <div class="app-shell" :class="{ 'app-shell--sidebar': useSidebarNavigation }">
    <AppSidebar
      v-if="useSidebarNavigation"
      :items="navigation.items"
      :loading="navigation.loading"
    />
    <section class="app-shell__content">
      <AppHeader
        :title="pageTitle"
        :menu-path="pageMenuPath"
        :items="navigation.items"
        :show-top-navigation="!useSidebarNavigation"
        :display-name="auth.user?.displayName"
        :roles="auth.user?.roles.map((role) => role.name)"
        @logout="handleLogout"
      />
      <TagView
        :tags="localizedTags"
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppMain from '@/components/layout/AppMain.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import TagView from '@/modules/system/tag-view/TagView.vue'
import { clearDynamicRoutes, installMenuRoutes } from '@/router/dynamicRoutes'
import { useAuthStore } from '@/modules/system/auth/auth.store'
import { useNavigationStore } from '@/modules/system/navigation/navigation.store'
import { useSettingsStore } from '@/modules/system/settings/settings.store'
import { useTagViewStore } from '@/modules/system/tag-view/tag-view.store'
import {
  resolveLocalizedLabel,
  useLocalization,
  type LocalizedLabel,
} from '@/modules/system/localization/localization'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const navigation = useNavigationStore()
const settings = useSettingsStore()
const tagView = useTagViewStore()
const { t } = useLocalization()
const narrowScreen = ref(matchesNarrowScreen())
const useSidebarNavigation = computed(
  () => narrowScreen.value || settings.settings.navigationMenuStyle === 'sidebar',
)
let narrowScreenQuery: MediaQueryList | undefined
const pageTitle = computed(() =>
  resolveLocalizedLabel(
    (route.meta.localizedTitle as LocalizedLabel | undefined) ?? {
      fallback: String(route.meta.title ?? t('navigation.shell.defaultTitle')),
    },
  ),
)
const pageMenuPath = computed(() => {
  const localizedPath = route.meta.localizedMenuPath as LocalizedLabel[] | undefined
  return localizedPath?.map(resolveLocalizedLabel).join(' / ') ?? pageTitle.value
})
const localizedTags = computed(() =>
  tagView.tags.map((tag) => {
    const localizedTitle = router.resolve(tag.path).meta.localizedTitle as
      LocalizedLabel | undefined
    return {
      ...tag,
      title: localizedTitle ? resolveLocalizedLabel(localizedTitle) : tag.title,
    }
  }),
)

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

onMounted(function startNarrowScreenMonitor() {
  narrowScreenQuery = window.matchMedia('(max-width: 1023px)')
  narrowScreen.value = narrowScreenQuery.matches
  narrowScreenQuery.addEventListener('change', synchronizeNarrowScreen)
})

onBeforeUnmount(function stopNarrowScreenMonitor() {
  narrowScreenQuery?.removeEventListener('change', synchronizeNarrowScreen)
})

function matchesNarrowScreen(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches
}

function synchronizeNarrowScreen(event: MediaQueryListEvent): void {
  narrowScreen.value = event.matches
}

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

.app-shell--sidebar {
  --app-sidebar-width: min(280px, calc(100vw - 48px));

  display: grid;
  grid-template-columns: var(--app-sidebar-width) minmax(0, 1fr);
  align-items: start;
}

.app-shell__content {
  min-width: 0;
  min-height: 100vh;
  min-height: 100dvh;
}

.app-shell--sidebar .app-shell__content {
  grid-column: 2;
  grid-row: 1;
}
</style>
