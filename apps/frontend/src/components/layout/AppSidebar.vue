<template>
  <aside id="app-sidebar" class="app-sidebar" :class="{ 'app-sidebar--open': open }">
    <div class="sidebar-atmosphere" />
    <header class="sidebar-brand">
      <CyberLogo class="sidebar-logo" tone="light" />
      <button
        class="sidebar-close"
        type="button"
        :aria-label="t('navigation.shell.closeMenu')"
        @click="$emit('close')"
      >
        <AppIcon name="close" />
      </button>
    </header>
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
import type { NavigationMenu } from '@scaffold/api-contract'
import AppIcon from '@/components/AppIcon.vue'
import CyberLogo from '@/components/brand/CyberLogo.vue'
import SidebarTree from './SidebarTree.vue'
import { useHealth } from '@/modules/system/health/composables/useHealth'
import { useLocalization } from '@/modules/system/localization/localization'

defineProps<{ items: NavigationMenu[]; open: boolean; loading?: boolean }>()
defineEmits<{ close: []; navigate: [] }>()

const { status, timestamp, error } = useHealth()
const { formatDateTime, t } = useLocalization()
</script>

<style lang="scss" scoped>
.app-sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
  display: flex;
  width: min(280px, calc(100vw - 48px));
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  flex-direction: column;
  visibility: hidden;
  color: var(--sidebar-text);
  background: linear-gradient(180deg, var(--sidebar-surface) 0%, var(--sidebar-surface-deep) 100%);
  box-shadow: 18px 0 48px rgba(4, 7, 6, 0.24);
  pointer-events: none;
  transform: translate3d(-100%, 0, 0);
  transition:
    transform 0.3s ease,
    visibility 0s linear 0.3s;
}

.app-sidebar--open {
  visibility: visible;
  pointer-events: auto;
  transform: translate3d(0, 0, 0);
  transition-delay: 0s;
}

.sidebar-atmosphere {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    radial-gradient(circle at 16% 0, rgba(112, 207, 162, 0.12), transparent 30%),
    linear-gradient(rgba(255, 255, 255, 0.018) 1px, transparent 1px);
  background-size:
    auto,
    100% 48px;
}

.sidebar-brand {
  position: relative;
  display: flex;
  height: var(--app-shell-header-height);
  flex: 0 0 var(--app-shell-header-height);
  align-items: center;
  gap: 12px;
  padding: 0 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  .sidebar-logo {
    --cyber-logo-mark-size: 42px;
    --cyber-logo-wordmark-size: 15px;
    --cyber-logo-descriptor-size: 7px;
  }
}

.sidebar-close {
  display: none;
  width: 34px;
  height: 34px;
  margin-left: auto;
  place-items: center;
  border: 0;
  border-radius: 11px;
  color: rgba(255, 255, 255, 0.68);
  background: rgba(255, 255, 255, 0.08);
}

.sidebar-navigation {
  position: relative;
  overflow-y: auto;
  flex: 1;
  padding: 22px 12px;
}

.sidebar-status {
  position: relative;
  display: flex;
  align-items: center;
  gap: 11px;
  margin: 12px;
  padding: 15px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.045);

  b {
    display: block;
    color: rgba(255, 255, 255, 0.82);
    font-size: 10px;
  }

  small {
    display: block;
    margin-top: 4px;
    color: rgba(255, 255, 255, 0.44);
    font-size: 7px;
    letter-spacing: 0.12em;
  }
}

.status-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary);
  box-shadow: 0 0 0 6px rgba(112, 207, 162, 0.1);

  &.loading {
    background: var(--warning);
    box-shadow: 0 0 0 6px rgba(201, 207, 112, 0.1);
  }

  &.error {
    background: var(--danger);
    box-shadow: 0 0 0 6px rgba(207, 112, 134, 0.1);
  }
}

.sidebar-empty {
  display: grid;
  min-height: 100px;
  place-items: center;
  align-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 10px;

  span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--primary);
    box-shadow: 0 0 0 6px rgba(112, 207, 162, 0.1);
  }
}

@media (min-width: 1024px) {
  .app-sidebar {
    position: sticky;
    top: 0;
    z-index: 10;
    grid-column: 1;
    grid-row: 1;
    width: 280px;
    visibility: visible;
    box-shadow: 12px 0 36px rgba(4, 7, 6, 0.14);
    pointer-events: auto;
    transform: none;
    transition: none;
  }
}

@media (max-width: 1023px) {
  .sidebar-close {
    display: grid;
  }
}
</style>
