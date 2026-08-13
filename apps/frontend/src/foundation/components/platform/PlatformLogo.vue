<template>
  <component :is="brand.logo" v-bind="$attrs" />
</template>

<script setup lang="ts">
import { usePlatformDefinition } from '@/foundation/platform/platform'

defineOptions({ inheritAttrs: false })

const { brand } = usePlatformDefinition()
</script>
