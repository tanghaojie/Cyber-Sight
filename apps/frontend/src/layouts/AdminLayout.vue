<template>
  <div class="min-h-screen bg-[#f5f4ee]">
    <button
      v-if="sidebarOpen"
      class="fixed inset-0 z-[35] border-0 bg-[#091510]/55 backdrop-blur-[2px] lg:hidden"
      type="button"
      aria-label="关闭菜单"
      @click="sidebarOpen = false"
    />
    <AppSidebar
      :groups="navigationGroups"
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
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '../components/layout/AppHeader.vue'
import AppMain from '../components/layout/AppMain.vue'
import AppSidebar from '../components/layout/AppSidebar.vue'
import { navigationGroups } from '../router/navigation.js'
import { useAuthStore } from '../stores/auth.js'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const sidebarOpen = ref(false)
const pageTitle = computed(() => String(route.meta.title ?? '管理控制台'))
const pageEyebrow = computed(() => String(route.meta.eyebrow ?? 'NOVA MANAGEMENT'))

async function handleLogout() {
  await auth.logout()
  await router.replace('/login')
}
</script>
