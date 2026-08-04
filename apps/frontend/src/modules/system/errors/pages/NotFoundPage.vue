<template>
  <main class="not-found-page">
    <div class="not-found-grid" />
    <section>
      <div class="error-code"><span>4</span><i>○</i><span>4</span></div>
      <p>{{ t('errors.notFound.kicker') }}</p>
      <h1>{{ t('errors.notFound.title') }}</h1>
      <span class="description">{{ t('errors.notFound.description') }}</span>
      <code v-if="sourcePath">{{ sourcePath }}</code>
      <div class="actions">
        <el-button type="primary" size="large" @click="goHome">{{
          t('errors.notFound.home')
        }}</el-button
        ><el-button size="large" @click="goBack">{{ t('errors.notFound.back') }}</el-button>
      </div>
    </section>
    <div class="brand-corner">
      <CyberLogo :show-descriptor="false" tone="light" />
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CyberLogo from '@/components/brand/CyberLogo.vue'
import { useLocalization } from '@/modules/system/localization/localization'

const route = useRoute(),
  router = useRouter()
const { t } = useLocalization()
const sourcePath = computed(() => (typeof route.query.from === 'string' ? route.query.from : ''))
async function goHome(): Promise<void> {
  await router.push('/')
}
function goBack(): void {
  // 没有可返回历史时回到静态首页，避免按钮在新标签页中无响应。
  if (window.history.length > 1) {
    router.back()
  } else {
    void router.push('/')
  }
}
</script>

<style scoped>
.not-found-page {
  position: relative;
  min-height: 100vh;
  display: grid;
  place-items: center;
  overflow: hidden;
  padding: 30px;
  color: var(--hero-foreground);
  background:
    radial-gradient(
      circle at 50% 42%,
      color-mix(in srgb, var(--brand-accent), transparent 80%),
      transparent 28%
    ),
    var(--hero-end);
}
.not-found-grid {
  position: absolute;
  inset: 0;
  opacity: 0.11;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(circle, #000, transparent 72%);
}
section {
  position: relative;
  z-index: 1;
  max-width: 680px;
  text-align: center;
}
.error-code {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: clamp(90px, 18vw, 180px);
  font-weight: 900;
  letter-spacing: -0.12em;
  line-height: 0.8;
}
.error-code i {
  display: grid;
  width: 0.62em;
  height: 0.62em;
  place-items: center;
  margin: 0 0.07em;
  border: 1px solid color-mix(in srgb, var(--brand-accent), transparent 52%);
  border-radius: 50%;
  color: var(--brand-accent);
  font-size: 0.48em;
  font-style: normal;
  box-shadow: inset 0 0 40px color-mix(in srgb, var(--brand-accent), transparent 88%);
}
section > p {
  margin: 36px 0 12px;
  color: var(--brand-accent);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.25em;
}
h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(25px, 4vw, 38px);
  letter-spacing: -0.04em;
}
.description {
  display: block;
  max-width: 540px;
  margin: 18px auto 0;
  color: var(--hero-muted);
  font-size: 13px;
  line-height: 1.8;
}
code {
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  margin-top: 20px;
  padding: 8px 13px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.42);
  background: rgba(255, 255, 255, 0.04);
  font-size: 10px;
  text-overflow: ellipsis;
}
.actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 30px;
}
.brand-corner {
  position: absolute;
  right: 28px;
  bottom: 24px;
  display: flex;
  align-items: center;
}
.brand-corner :deep(.cyber-logo) {
  --cyber-logo-mark-size: 34px;
  --cyber-logo-wordmark-size: 11px;
}
@media (max-width: 540px) {
  .actions {
    flex-direction: column;
  }
  .brand-corner {
    right: 50%;
    transform: translateX(50%);
  }
}
</style>
