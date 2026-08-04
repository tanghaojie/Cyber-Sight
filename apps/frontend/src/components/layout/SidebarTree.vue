<template>
  <ul class="sidebar-tree" :class="{ 'sidebar-tree--nested': depth > 0 }">
    <!-- 首页属于静态路由，只在根层额外插入一次。 -->
    <RouterLink
      v-if="depth === 0 && showHomeMenu"
      :to="homeRoute?.path || '/'"
      class="sidebar-link"
      :style="indentStyle"
      @click="$emit('navigate')"
    >
      <span class="sidebar-node-icon">
        <AppIcon :name="(homeRoute?.meta?.icon as string | undefined) || 'home'" />
      </span>
      <span class="sidebar-node-copy">
        <b>{{ t('navigation.routes.home') }}</b>
        <small>{{ homeRoute?.path || '/' }}</small>
      </span>
    </RouterLink>
    <li v-for="item in items" :key="item.id">
      <button
        v-if="item.type === 'directory' && item.children.length"
        class="sidebar-directory"
        type="button"
        :style="indentStyle"
        :aria-expanded="expanded[item.id] !== false"
        @click="toggle(item.id)"
      >
        <span class="sidebar-node-icon"><AppIcon :name="item.icon || 'layers'" /></span>
        <span class="sidebar-node-copy">
          <b>{{ resolveLocalizedLabel(navigationLabel(item)) }}</b>
          <small>{{ t('navigation.shell.childCount', { count: item.children.length }) }}</small>
        </span>
        <AppIcon
          name="chevron-down"
          class="directory-chevron"
          :class="{ 'directory-chevron--closed': expanded[item.id] === false }"
        />
      </button>
      <RouterLink
        v-else-if="item.type === 'menu'"
        :to="item.path"
        class="sidebar-link"
        :style="indentStyle"
        @click="$emit('navigate')"
      >
        <span class="sidebar-node-icon"><AppIcon :name="item.icon || 'menu'" /></span>
        <span class="sidebar-node-copy">
          <b>{{ resolveLocalizedLabel(navigationLabel(item)) }}</b>
          <small>{{ item.path }}</small>
        </span>
      </RouterLink>
      <a
        v-else-if="item.type === 'button'"
        :href="item.externalUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="sidebar-link"
        :style="indentStyle"
        @click="$emit('navigate')"
      >
        <span class="sidebar-node-icon"><AppIcon :name="item.icon || 'external'" /></span>
        <span class="sidebar-node-copy">
          <b>{{ resolveLocalizedLabel(navigationLabel(item)) }}</b>
          <small>{{ t('navigation.shell.externalLink') }}</small>
        </span>
        <AppIcon name="external" class="external-icon" />
      </a>
      <!-- 目录递归复用本组件，depth 同时驱动视觉缩进。 -->
      <SidebarTree
        v-if="item.type === 'directory' && item.children.length && expanded[item.id] !== false"
        :items="item.children"
        :depth="depth + 1"
        @navigate="$emit('navigate')"
      />
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { NavigationMenu } from '@scaffold/api-contract'
import AppIcon from '@/components/AppIcon.vue'
import constRoutes from '@/router/constRoutes'
import { RouteRecordRaw } from 'vue-router'
import { navigationLabel } from '@/modules/system/navigation/navigation.labels'
import { useLocalization } from '@/modules/system/localization/localization'

const props = withDefaults(defineProps<{ items: NavigationMenu[]; depth?: number }>(), { depth: 0 })
defineEmits<{ navigate: [] }>()

const { resolveLocalizedLabel, t } = useLocalization()
const homeRoute = computed(() => constRoutes.find((route: RouteRecordRaw) => route.path === '/'))

const showHomeMenu = computed(() => {
  // 根路由有空路径首页子项时显示首页；没有 children 时兼容简单静态根路由。
  if (!homeRoute.value) {
    return false
  }
  if (!homeRoute.value.children || homeRoute.value.children.length <= 0) {
    return true
  }

  const children = homeRoute.value.children
  return !!children.find((c) => c.path === '')
})

const expanded = reactive<Record<number, boolean>>({})

const indentStyle = computed(() => ({ paddingLeft: `${14 + props.depth * 14}px` }))

function toggle(id: number): void {
  expanded[id] = expanded[id] === false
}
</script>

<style lang="scss" scoped>
.sidebar-tree {
  display: grid;
  gap: 3px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.sidebar-tree--nested {
  position: relative;
  margin: 3px 0 7px;
}

.sidebar-directory,
.sidebar-link {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 54px;
  align-items: center;
  gap: 11px;
  padding-top: 7px;
  padding-right: 11px;
  padding-bottom: 7px;
  border: 0;
  border-radius: 15px;
  color: rgba(241, 245, 243, 0.76);
  background: transparent;
  text-align: left;
  transition:
    color 0.18s ease,
    background 0.18s ease,
    box-shadow 0.18s ease;

  &:hover {
    color: #fff;
    background: rgba(255, 255, 255, 0.08);
  }
}

.sidebar-link.router-link-active {
  color: var(--brand-accent-foreground);
  background: var(--brand-accent);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.28);
}

.sidebar-node-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 11px;
  color: inherit;
  background: rgba(255, 255, 255, 0.08);
}

.router-link-active .sidebar-node-icon {
  background: color-mix(in srgb, var(--brand-accent-foreground), transparent 88%);
}

.sidebar-node-copy {
  min-width: 0;
  flex: 1;

  b,
  small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    font-size: 12px;
    font-weight: 750;
  }

  small {
    margin-top: 3px;
    opacity: 0.58;
    font-size: 8px;
    letter-spacing: 0.06em;
  }
}

.node-arrow {
  opacity: 0.48;
  font-size: 17px;
}

.directory-chevron {
  width: 14px;
  height: 14px;
  opacity: 0.58;
  transition: transform 0.18s;
}

.directory-chevron--closed {
  transform: rotate(-90deg);
}

.external-icon {
  width: 13px;
  height: 13px;
  opacity: 0.55;
}
</style>
