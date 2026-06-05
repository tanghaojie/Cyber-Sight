<template>
  <main>
    <h1>AI Web Scaffold</h1>
    <p>Backend status: <strong>{{ status }}</strong></p>
    <p v-if="timestamp">Last checked: {{ timestamp }}</p>
    <p v-if="error" style="color: red">{{ error }}</p>
    <button @click="fetchHealth">Refresh</button>
  </main>
</template>

<script setup lang="ts">
import { useHealth } from '../modules/health/composables/useHealth.js'

const { status, timestamp, error, fetchHealth } = useHealth()
</script>
