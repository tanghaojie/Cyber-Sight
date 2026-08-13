<template>
  <slot />
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useSettingsStore } from './settings.store'

const settingsStore = useSettingsStore()

watch(
  () => [settingsStore.settings.themeColor, settingsStore.settings.darkMode] as const,
  function applyTheme([themeColor, darkMode]) {
    const root = document.documentElement
    root.dataset.theme = themeColor
    root.classList.toggle('dark', darkMode)
    root.style.colorScheme = darkMode ? 'dark' : 'light'
  },
  { immediate: true },
)
</script>
