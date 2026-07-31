<template>
  <div
    class="creator-credit"
    :class="`creator-credit--${tone}`"
    :aria-label="`${t('localization.creator.createdBy')} ${appConfig.creatorName} ${appConfig.creatorFullName}`"
  >
    <span>{{ t('localization.creator.createdBy') }}</span>
    <i aria-hidden="true" />
    <div>
      <strong>{{ appConfig.creatorName }}</strong>
      <small>{{ appConfig.creatorFullName }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { appConfig } from '@/config/app.config'
import { useLocalization } from '@/modules/system/localization/localization'

withDefaults(defineProps<{ tone?: 'dark' | 'light' }>(), { tone: 'light' })

const { t } = useLocalization()
</script>

<style scoped>
.creator-credit {
  --creator-credit-ink: rgba(255, 255, 255, 0.82);
  --creator-credit-muted: rgba(255, 255, 255, 0.34);
  --creator-credit-line: rgba(255, 255, 255, 0.16);
  display: inline-grid;
  grid-template-columns: auto minmax(34px, 64px) auto;
  align-items: center;
  gap: 12px;
}

.creator-credit--dark {
  --creator-credit-ink: var(--ink);
  --creator-credit-muted: var(--muted);
  --creator-credit-line: var(--line);
}

.creator-credit > span {
  color: var(--creator-credit-muted);
  font-size: 7px;
  font-weight: 800;
  letter-spacing: 0.22em;
  white-space: nowrap;
}

.creator-credit > i {
  width: 100%;
  height: 1px;
  background: var(--creator-credit-line);
}

.creator-credit > div {
  display: grid;
  grid-template-columns: auto auto;
  align-items: baseline;
  gap: 7px;
  white-space: nowrap;
}

.creator-credit strong {
  color: var(--creator-credit-ink);
  font-family: var(--font-display);
  font-size: 11px;
  letter-spacing: 0.1em;
}

.creator-credit small {
  color: var(--creator-credit-muted);
  font-size: 8px;
  letter-spacing: 0.08em;
}
</style>
