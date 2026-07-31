<template>
  <!-- 根组件只组装运行时语言环境和路由出口，应用壳由具体布局组件负责。 -->
  <LocalizationProvider>
    <RouterView />
  </LocalizationProvider>
</template>

<script setup lang="ts">
import LocalizationProvider from '@/modules/system/localization/LocalizationProvider.vue'
</script>
