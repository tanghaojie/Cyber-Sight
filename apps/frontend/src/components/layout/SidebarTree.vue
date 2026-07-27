<template>
  <ul class="sidebar-tree" :class="{ 'sidebar-tree--nested': depth > 0 }">
    <li v-for="item in items" :key="item.id">
      <button v-if="item.type === 'directory'" class="sidebar-directory" type="button" :style="indentStyle" :aria-expanded="expanded[item.id] !== false" @click="toggle(item.id)">
        <span class="sidebar-node-icon"><AppIcon :name="item.icon || 'layers'" /></span>
        <span class="sidebar-node-copy"><b>{{ item.name }}</b><small>{{ item.children.length }} 个节点</small></span>
        <AppIcon name="chevron-down" class="directory-chevron" :class="{ 'directory-chevron--closed': expanded[item.id] === false }" />
      </button>
      <RouterLink v-else-if="item.type === 'menu'" :to="item.path" class="sidebar-link" :style="indentStyle" @click="$emit('navigate')">
        <span class="sidebar-node-icon"><AppIcon :name="item.icon || 'menu'" /></span>
        <span class="sidebar-node-copy"><b>{{ item.name }}</b><small>{{ item.code.replaceAll('_', ' ') }}</small></span>
        <span class="node-arrow">›</span>
      </RouterLink>
      <a v-else :href="item.externalUrl" target="_blank" rel="noopener noreferrer" class="sidebar-link sidebar-link--external" :style="indentStyle" @click="$emit('navigate')">
        <span class="sidebar-node-icon"><AppIcon :name="item.icon || 'external'" /></span>
        <span class="sidebar-node-copy"><b>{{ item.name }}</b><small>EXTERNAL LINK</small></span>
        <AppIcon name="external" class="external-icon" />
      </a>
      <SidebarTree v-if="item.type === 'directory' && item.children.length && expanded[item.id] !== false" :items="item.children" :depth="depth + 1" @navigate="$emit('navigate')" />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { NavigationMenu } from '@scaffold/api-contract'
import AppIcon from '../AppIcon.vue'

const props = withDefaults(defineProps<{ items: NavigationMenu[]; depth?: number }>(), { depth: 0 })
defineEmits<{ navigate: [] }>()
const expanded = reactive<Record<number, boolean>>({})
const indentStyle = computed(() => ({ paddingLeft: `${14 + props.depth * 14}px` }))
function toggle(id: number): void { expanded[id] = expanded[id] === false }
</script>
