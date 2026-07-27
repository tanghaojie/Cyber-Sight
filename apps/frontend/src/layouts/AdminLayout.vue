<template>
  <div class="min-h-screen bg-[var(--canvas)]">
    <button
      v-if="sidebarOpen"
      class="fixed inset-0 z-[35] border-0 bg-[#091510]/55 backdrop-blur-[2px] lg:hidden"
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
    <section class="min-w-0 lg:pl-[280px]">
      <AppHeader
        :title="pageTitle"
        :eyebrow="pageEyebrow"
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
import AppHeader from '../components/layout/AppHeader.vue'
import AppMain from '../components/layout/AppMain.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import { installMenuRoutes, clearDynamicRoutes } from '../router/index.js'
import { useAuthStore } from '../modules/auth/index.js'
import { useNavigationStore } from '../modules/navigation/index.js'
import { appConfig } from '../config/app.config.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const navigation = useNavigationStore()
const sidebarOpen = ref(false)
const pageTitle = computed(() => String(route.meta.title ?? '管理控制台'))
const pageEyebrow = computed(() => String(route.meta.eyebrow ?? `${appConfig.name.toUpperCase()} / MANAGEMENT`))

watch(() => navigation.items, function refreshRoutes(items) {
  if (navigation.loaded) installMenuRoutes(router, items)
}, { deep: true })

async function handleLogout() {
  await auth.logout()
  navigation.clear()
  clearDynamicRoutes()
  await router.replace('/login')
}
</script>
