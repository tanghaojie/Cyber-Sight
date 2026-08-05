<template>
  <section class="management-page" aria-labelledby="api-logs-title">
    <header class="page-intro api-logs-intro">
      <div>
        <p class="page-kicker">{{ t('api-logs.page.kicker') }}</p>
        <h2 id="api-logs-title">{{ t('api-logs.page.title') }}</h2>
        <span>{{ t('api-logs.page.description') }}</span>
      </div>
    </header>

    <ApiLogsList />
  </section>
</template>

<script setup lang="ts">
import ApiLogsList from './components/ApiLogsList.vue'
import { useLocalization } from '@/modules/system/localization/localization'

const { t } = useLocalization()
</script>
