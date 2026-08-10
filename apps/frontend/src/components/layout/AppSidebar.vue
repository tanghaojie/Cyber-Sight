<template>
  <aside
    id="app-sidebar"
    class="app-sidebar"
    :class="{
      'app-sidebar--drawer': drawer,
      'app-sidebar--open': !drawer || open,
      'app-sidebar--without-logo': !showLogo,
    }"
  >
    <div class="sidebar-atmosphere" />
    <header v-if="showLogo" class="sidebar-brand">
      <CyberLogo class="sidebar-logo" tone="light" />
      <button
        v-if="drawer"
        class="sidebar-close"
        type="button"
        :aria-label="t('navigation.shell.closeMenu')"
        @click="$emit('close')"
      >
        <AppIcon name="close" />
      </button>
    </header>
    <button
      v-else-if="drawer"
      class="sidebar-close sidebar-close--floating"
      type="button"
      :aria-label="t('navigation.shell.closeMenu')"
      @click="$emit('close')"
    >
      <AppIcon name="close" />
    </button>
    <nav class="sidebar-navigation" :aria-label="t('navigation.shell.mainNavigation')">
      <!-- 菜单树来自当前用户导航 Store；空态区分正在请求和确实无可用菜单。 -->
      <SidebarTree v-if="items.length" :items="items" @navigate="$emit('navigate')" />
      <div v-else class="sidebar-empty">
        <span />{{
          loading ? t('navigation.shell.loadingNavigation') : t('navigation.shell.emptyNavigation')
        }}
      </div>
    </nav>
    <footer class="sidebar-status">
      <!-- 健康状态独立于导航加载，用于提示后端进程是否仍可响应。 -->
      <span class="status-pulse" :class="status" />
      <div>
        <b v-if="status === 'ok'">{{ t('navigation.shell.statusOk') }}</b>
        <b v-else-if="status === 'loading'">{{ t('navigation.shell.statusLoading') }}</b>
        <b v-else-if="status === 'error'">{{ error ?? t('navigation.shell.statusUnknown') }}</b>
        <b v-else>{{ t('navigation.shell.statusUnknown') }}</b>
        <small v-if="timestamp">{{ formatDateTime(timestamp, { timeStyle: 'medium' }) }}</small>
      </div>
    </footer>
  </aside>
</template>

<script setup lang="ts">
import type { NavigationMenu } from '@cyber-ai-forge/api-contract'
import AppIcon from '@/components/AppIcon.vue'
import CyberLogo from '@/components/brand/CyberLogo.vue'
import SidebarTree from './SidebarTree.vue'
import { useHealth } from '@/modules/system/health/composables/useHealth'
import { useLocalization } from '@/modules/system/localization/localization'

withDefaults(
  defineProps<{
    items: NavigationMenu[]
    drawer?: boolean
    open?: boolean
    loading?: boolean
    showLogo?: boolean
  }>(),
  {
    drawer: false,
    open: true,
    showLogo: true,
  },
)
defineEmits<{ close: []; navigate: [] }>()

const { status, timestamp, error } = useHealth()
const { formatDateTime, t } = useLocalization()
</script>

<style lang="scss" scoped>
.app-sidebar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  width: var(--app-sidebar-width);
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  flex-direction: column;
  color: var(--sidebar-text);
  background: linear-gradient(180deg, var(--sidebar-surface) 0%, var(--sidebar-surface-deep) 100%);
  box-shadow: 12px 0 36px color-mix(in srgb, var(--sidebar-surface-deep), transparent 72%);
}

.app-sidebar--drawer {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  width: min(280px, calc(100vw - 48px));
  visibility: hidden;
  box-shadow: 18px 0 48px color-mix(in srgb, var(--sidebar-surface-deep), transparent 58%);
  pointer-events: none;
  transform: translate3d(-100%, 0, 0);
  transition:
    transform 0.3s ease,
    visibility 0s linear 0.3s;
}

.app-sidebar--drawer.app-sidebar--open {
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0);
  transition-delay: 0s;
}

.sidebar-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: radial-gradient(
    circle at 16% 0,
    color-mix(in srgb, var(--brand-accent), transparent 84%),
    transparent 30%
  );
}

.sidebar-brand {
  position: relative;
  display: flex;
  height: var(--app-shell-header-height);
  flex: 0 0 var(--app-shell-header-height);
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  border-bottom: 1px solid var(--sidebar-line);

  .sidebar-logo {
    --cyber-logo-mark-size: 42px;
    --cyber-logo-wordmark-size: 15px;
    --cyber-logo-descriptor-size: 7px;
  }
}

.sidebar-close {
  display: grid;
  width: 34px;
  height: 34px;
  margin-left: auto;
  place-items: center;
  border: 0;
  border-radius: 11px;
  color: var(--sidebar-muted);
  background: var(--sidebar-surface-hover);
}

.sidebar-close--floating {
  position: absolute;
  z-index: 1;
  top: 19px;
  right: 24px;
  margin-left: 0;
}

.sidebar-navigation {
  position: relative;
  overflow-y: auto;
  flex: 1;
  padding: 22px 12px;
}

.app-sidebar--drawer.app-sidebar--without-logo .sidebar-navigation {
  padding-top: 70px;
}

.sidebar-status {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 12px;
  padding: 15px;
  border: 1px solid var(--sidebar-line);
  border-radius: 16px;
  background: var(--sidebar-surface-soft);

  b {
    display: block;
    color: var(--sidebar-text);
    font-size: 10px;
  }

  small {
    display: block;
    margin-top: 4px;
    color: var(--sidebar-faint);
    font-size: 7px;
    letter-spacing: 0.12em;
  }
}

.status-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--success), transparent 86%);

  &.loading {
    background: var(--sidebar-text);
    box-shadow: 0 0 0 6px var(--sidebar-surface-hover);
  }

  &.error {
    background: var(--danger);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--danger), transparent 86%);
  }
}

.sidebar-empty {
  display: grid;
  min-height: 100px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: var(--sidebar-faint);
  font-size: 10px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--success);
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--success), transparent 86%);
  }
}
</style>
