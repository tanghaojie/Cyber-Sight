<template>
  <header class="app-header">
    <div class="app-header__leading">
      <button
        class="app-header__menu-button"
        type="button"
        :aria-label="t('navigation.shell.openMenu')"
        aria-controls="app-sidebar"
        @click="$emit('open-menu')"
      >
        <AppIcon name="panel" />
      </button>
      <div class="app-header__title-group">
        <p class="app-header__menu-path">{{ menuPath }}</p>
        <h1 class="app-header__title">{{ title }}</h1>
      </div>
    </div>

    <TopNavigation :items="items" />

    <div class="app-header__actions">
      <LanguageSwitcher compact />
      <el-dropdown trigger="click" @command="handleCommand">
        <button class="app-header__user" type="button">
          <span class="app-header__avatar">{{ initials }}</span>
          <span class="app-header__user-copy">
            <b>{{ displayName }}</b>
            <small>{{ roleNames }}</small>
          </span>
          <ArrowDown class="app-header__user-arrow" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="settings">
              <Setting class="app-header__dropdown-icon" />
              {{ t('settings.dropdown.open') }}
            </el-dropdown-item>
            <el-dropdown-item divided command="logout">
              <SwitchButton class="app-header__dropdown-icon" />
              {{ t('navigation.shell.logout') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <SettingsDialog v-model="settingsOpen" />
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { ArrowDown, Setting, SwitchButton } from '@element-plus/icons-vue'
import type { NavigationMenu } from '@scaffold/api-contract'
import AppIcon from '@/components/AppIcon.vue'
import TopNavigation from '@/components/layout/TopNavigation.vue'
import LanguageSwitcher from '@/modules/system/localization/LanguageSwitcher.vue'
import { useLocalization } from '@/modules/system/localization/localization'
import SettingsDialog from '@/modules/system/settings/SettingsDialog.vue'

const props = defineProps<{
  title: string
  menuPath: string
  items: NavigationMenu[]
  displayName?: string
  roles?: string[]
}>()

const emit = defineEmits<{
  'open-menu': []
  logout: []
}>()

const { t } = useLocalization()
const initials = computed(() => props.displayName?.slice(0, 1).toUpperCase() ?? 'A')
const roleNames = computed(
  () => props.roles?.filter(Boolean).join('、') || t('navigation.shell.defaultRole'),
)
const settingsOpen = ref(false)

function handleCommand(command: string) {
  if (command === 'settings') {
    settingsOpen.value = true
  } else if (command === 'logout') {
    emit('logout')
  }
}
</script>

<style lang="scss" scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  width: 100%;
  height: var(--app-shell-header-height);
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 0 20px;
  border-bottom: 1px solid var(--line);
  background: rgba(242, 247, 244, 0.9);
  backdrop-filter: blur(18px);
}

.app-header__leading,
.app-header__actions,
.app-header__user {
  display: flex;
  align-items: center;
}

.app-header__leading {
  min-width: 0;
  flex: 0 1 auto;
  gap: 16px;
}

.app-header__actions {
  flex: 0 0 auto;
  gap: 12px;
}

.top-navigation {
  display: none;
}

.app-header__menu-button {
  display: grid;
  width: 44px;
  height: 44px;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--line);
  border-radius: 16px;
  color: var(--ink-soft);
  background: var(--surface);
  box-shadow: 0 4px 12px rgba(18, 60, 49, 0.06);
  transition:
    border-color 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: var(--primary);
    transform: translateY(-2px);
  }
}

.app-header__title-group {
  min-width: 0;
}

.app-header__menu-path {
  display: none;
  margin: 0 0 4px;
  color: #829087;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.2em;
}

.app-header__title {
  overflow: hidden;
  margin: 0;
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.025em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header__lab-status {
  display: none;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
  color: var(--muted);
  background: rgba(255, 255, 255, 0.65);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.025em;

  span {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--primary-deep);
  }
}

.app-header__user {
  gap: 10px;
  padding: 6px 8px 6px 6px;
  border: 0;
  border-radius: 16px;
  color: inherit;
  background: transparent;
  text-align: left;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.75);
  }
}

.app-header__avatar {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 12px;
  color: var(--primary);
  background: var(--primary-deep);
  box-shadow: 0 10px 22px rgba(18, 60, 49, 0.1);
  font-size: 14px;
  font-weight: 900;
}

.app-header__user-copy {
  display: none;
  min-width: 0;

  b,
  small {
    display: block;
    overflow: hidden;
    max-width: 128px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    color: #26352f;
    font-size: 12px;
    font-weight: 800;
  }

  small {
    margin-top: 2px;
    color: #819087;
    font-size: 10px;
  }
}

.app-header__user-arrow {
  display: none;
  width: 14px;
  height: 14px;
  color: #829087;
}

.app-header__dropdown-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

@media (min-width: 640px) {
  .app-header {
    padding-right: 32px;
    padding-left: 32px;
  }

  .app-header__menu-path {
    display: block;
  }

  .app-header__title {
    font-size: 24px;
  }

  .app-header__user-copy,
  .app-header__user-arrow {
    display: block;
  }
}

@media (min-width: 768px) {
  .app-header__lab-status {
    display: flex;
  }
}

@media (min-width: 1024px) {
  .app-header {
    padding-right: 40px;
    padding-left: 40px;
  }

  .app-header__menu-button {
    display: none;
  }

  .top-navigation {
    display: block;
  }

  .app-header__title-group {
    max-width: 210px;
  }
}
</style>
