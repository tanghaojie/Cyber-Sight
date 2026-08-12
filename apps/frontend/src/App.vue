<template>
  <!-- 根组件只组装运行时语言环境和路由出口，应用壳由具体布局组件负责。 -->
  <LocalizationProvider>
    <ThemeController>
      <RouterView />
    </ThemeController>
  </LocalizationProvider>
</template>

<script setup lang="ts">
import LocalizationProvider from '@/foundation/modules/localization/LocalizationProvider.vue'
import ThemeController from '@/foundation/modules/settings/ThemeController.vue'
</script>
