<template>
  <header class="app-header">
    <div class="app-header__leading">
      <button
        class="app-header__menu-button"
        type="button"
        aria-label="打开菜单"
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

    <div class="app-header__actions">
      <el-dropdown trigger="click" @command="handleCommand">
        <button class="app-header__user" type="button">
          <span class="app-header__avatar">{{ initials }}</span>
          <span class="app-header__user-copy">
            <b>{{ displayName }}</b>
            <small>{{ role }}</small>
          </span>
          <ArrowDown class="app-header__user-arrow" />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="logout">
              <SwitchButton class="app-header__logout-icon" />
              退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps<{
  title: string
  menuPath: string
  displayName?: string
  role?: string
}>()

const emit = defineEmits<{
  'open-menu': []
  logout: []
}>()

const initials = computed(() => props.displayName?.slice(0, 1).toUpperCase() ?? 'A')

function handleCommand(command: string) {
  // 下拉菜单后续可扩展其他命令，当前只把退出动作转交应用壳处理。
  if (command === 'logout') {
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
  height: 96px;
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
  gap: 16px;
}

.app-header__actions {
  flex: 0 0 auto;
  gap: 12px;
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

.app-header__logout-icon {
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
}
</style>
