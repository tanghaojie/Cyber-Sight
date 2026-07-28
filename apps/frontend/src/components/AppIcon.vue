<template>
  <svg class="icon" aria-hidden="true" focusable="false">
    <use :href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { resolveIconName } from '@/shared/icons/icon-registry.js'

const props = defineProps<{ name: string }>()
const symbolId = computed(() => `#icon-${resolveIconName(props.name)}`)
</script>
