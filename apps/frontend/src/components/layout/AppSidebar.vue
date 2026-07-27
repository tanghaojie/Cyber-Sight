<template>
  <aside class="app-sidebar" :class="open ? 'translate-x-0' : '-translate-x-full'">
    <div class="sidebar-atmosphere" />
    <header class="sidebar-brand">
      <span class="brand-mark">{{ brandInitials() }}</span>
      <div><strong>{{ appConfig.name }}</strong><small>{{ appConfig.productLabel }}</small></div>
      <button class="sidebar-close" type="button" aria-label="关闭菜单" @click="$emit('close')"><AppIcon name="close" /></button>
    </header>
    <nav class="sidebar-navigation" aria-label="主导航">
      <p class="sidebar-label">DATABASE NAVIGATION</p>
      <SidebarTree v-if="items.length" :items="items" @navigate="$emit('navigate')" />
      <div v-else class="sidebar-empty"><span />{{ loading ? '正在装载导航…' : '暂无可用菜单' }}</div>
    </nav>
    <footer class="sidebar-status"><span class="status-pulse" /><div><b>系统运行正常</b><small>ALL SERVICES OPERATIONAL</small></div></footer>
  </aside>
</template>

<script setup lang="ts">
import type { NavigationMenu } from '@scaffold/api-contract'
import { appConfig, brandInitials } from '../../config/app.config.js'
import AppIcon from '../AppIcon.vue'
import SidebarTree from './SidebarTree.vue'

defineProps<{ items: NavigationMenu[]; open: boolean; loading?: boolean }>()
defineEmits<{ close: []; navigate: [] }>()
</script>
