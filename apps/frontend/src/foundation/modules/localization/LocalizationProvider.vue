<template>
  <el-config-provider :locale="elementPlusLocale">
    <slot />
  </el-config-provider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import en from 'element-plus/es/locale/lang/en'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { useLocalization } from './localization'

const { currentLocale } = useLocalization()
const elementPlusLocale = computed(() => (currentLocale.value === 'en-US' ? en : zhCn))
</script>
