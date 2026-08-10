<script setup lang="ts">
import apiLogsScreenshot from '../assets/screenshots/api-logs.png'
import homeScreenshot from '../assets/screenshots/home.png'
import menusScreenshot from '../assets/screenshots/menus.png'
import rolesScreenshot from '../assets/screenshots/roles.png'
import settingsScreenshot from '../assets/screenshots/settings.png'
import usersScreenshot from '../assets/screenshots/users.png'
import type { SceneContent } from '../content'

defineProps<{
  scene: SceneContent
}>()

const screenshots: Record<SceneContent['kind'], string> = {
  home: homeScreenshot,
  users: usersScreenshot,
  roles: rolesScreenshot,
  navigation: menusScreenshot,
  logs: apiLogsScreenshot,
  settings: settingsScreenshot,
}
</script>

<template>
  <div class="product-scene" :data-kind="scene.kind" aria-hidden="true">
    <img
      class="product-screenshot"
      :src="screenshots[scene.kind]"
      alt=""
      decoding="async"
      draggable="false"
    />
  </div>
</template>
