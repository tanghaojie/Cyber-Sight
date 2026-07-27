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
        <p class="app-header__eyebrow">{{ eyebrow }}</p>
        <h1 class="app-header__title">{{ title }}</h1>
      </div>
    </div>

    <div class="app-header__actions">
      <div class="app-header__lab-status">
        <span />
        LIVE · LAB
      </div>

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
import AppIcon from '../AppIcon.vue'

const props = defineProps<{
  title: string
  eyebrow: string
  displayName?: string
  role?: string
}>()

const emit = defineEmits<{
  'open-menu': []
  logout: []
}>()

const initials = computed(() => props.displayName?.slice(0, 1).toUpperCase() ?? 'A')

function handleCommand(command: string) {
  if (command === 'logout') emit('logout')
}
</script>
