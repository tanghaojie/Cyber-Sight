<template>
  <section class="home-grid" :aria-label="t('home.overview.label')">
    <article class="hero-panel">
      <div class="hero-mesh" />
      <div class="hero-copy">
        <p>{{ todayLabel }} · {{ t('home.hero.kicker') }}</p>
        <h2>{{ t('home.hero.lineOne') }}<br />{{ t('home.hero.lineTwo') }}</h2>
        <span>{{ t('home.hero.description', { name: appConfig.fullName }) }}</span>
      </div>
      <div class="hero-index">
        <small>{{ t('home.hero.systemIndex') }}</small
        ><b>{{ String(navigation.flatItems.length).padStart(2, '0') }}</b
        ><span>{{ t('home.hero.activeNodes') }}</span>
      </div>
    </article>
    <div class="module-grid">
      <template v-for="item in quickEntries" :key="item.id">
        <RouterLink v-if="item.type === 'menu'" :to="item.path" class="module-card"
          ><span class="module-card__icon"><AppIcon :name="item.icon" /></span
          ><span class="module-card__arrow">↗</span
          ><b>{{ resolveLocalizedLabel(navigationLabel(item)) }}</b
          ><small>{{ item.path }}</small></RouterLink
        >
        <a
          v-else
          :href="item.externalUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="module-card"
          ><span class="module-card__icon"><AppIcon :name="item.icon || 'external'" /></span
          ><span class="module-card__arrow">↗</span
          ><b>{{ resolveLocalizedLabel(navigationLabel(item)) }}</b
          ><small>{{ t('home.cards.externalResource') }}</small></a
        >
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { appConfig } from '@/config/app.config'
import AppIcon from '@/components/AppIcon.vue'
import { useNavigationStore } from '@/modules/system/navigation/navigation.store'
import { navigationLabel } from '@/modules/system/navigation/navigation.labels'
import { useLocalization } from '@/modules/system/localization/localization'

const navigation = useNavigationStore()
const { formatDateTime, resolveLocalizedLabel, t } = useLocalization()
// 快捷入口取当前用户前四个可访问页面或外链，目录和首页自身不重复展示。
const quickEntries = computed(() =>
  navigation.flatItems
    .filter((item) => (item.type === 'menu' && item.path !== '/') || item.type === 'button')
    .slice(0, 4),
)
const todayLabel = computed(() =>
  formatDateTime(new Date(), {
    weekday: 'long',
    month: 'short',
    day: '2-digit',
  }).toUpperCase(),
)
</script>

<style scoped>
.home-grid {
  width: min(100%, 1480px);
  display: grid;
  gap: 20px;
  margin: 0 auto;
}
.hero-panel {
  position: relative;
  min-height: 330px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: end;
  overflow: hidden;
  padding: 38px;
  border-radius: 32px;
  color: var(--hero-foreground);
  background: linear-gradient(135deg, var(--hero-start), var(--hero-end) 76%);
  box-shadow: 0 25px 70px color-mix(in srgb, var(--hero-start), transparent 68%);
}
.hero-mesh {
  position: absolute;
  inset: 0;
  opacity: 0.75;
  background-image:
    radial-gradient(
      circle at 79% 14%,
      color-mix(in srgb, var(--brand-accent), transparent 58%),
      transparent 24%
    ),
    linear-gradient(116deg, transparent 58%, rgba(255, 255, 255, 0.045) 58%);
}
.hero-copy,
.hero-index {
  position: relative;
}
.hero-copy {
  max-width: 760px;
}
.hero-copy p {
  margin: 0 0 22px;
  color: var(--brand-accent);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.23em;
}
.hero-copy h2 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(32px, 4vw, 50px);
  letter-spacing: -0.05em;
  line-height: 1.08;
}
.hero-copy span {
  display: block;
  max-width: 620px;
  margin-top: 20px;
  color: var(--hero-muted);
  font-size: 13px;
  line-height: 1.8;
}
.hero-index {
  display: grid;
  justify-items: end;
  padding-left: 30px;
}
.hero-index small,
.hero-index span {
  color: var(--hero-meta);
  font-size: 8px;
  letter-spacing: 0.18em;
}
.hero-index b {
  font-family: var(--font-display);
  font-size: 68px;
  letter-spacing: -0.08em;
}
.module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}
.module-card {
  min-height: 170px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-content: space-between;
  padding: 20px;
  border: 1px solid var(--line);
  border-radius: 24px;
  background: color-mix(in srgb, var(--surface), transparent 12%);
  box-shadow: 0 15px 40px color-mix(in srgb, var(--ink), transparent 96%);
  transition: 0.2s;
}
.module-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 20px 50px color-mix(in srgb, var(--primary), transparent 88%);
}
.module-card__icon {
  display: grid;
  width: 43px;
  height: 43px;
  place-items: center;
  border-radius: 15px;
  color: var(--primary-deep);
  background: var(--primary-mist);
}
.module-card__arrow {
  color: var(--muted);
  transition: 0.2s;
}
.module-card:hover .module-card__arrow {
  transform: translate(2px, -2px);
  color: var(--primary-deep);
}
.module-card b {
  grid-column: 1/-1;
  align-self: end;
  margin-top: 28px;
  font-family: var(--font-display);
  font-size: 16px;
}
.module-card small {
  grid-column: 1/-1;
  margin-top: 5px;
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 0.11em;
}
.home-detail-grid {
  display: grid;
  grid-template-columns: 1.45fr 0.55fr;
  gap: 14px;
}
.architecture-card {
  display: flex;
  justify-content: space-between;
  gap: 28px;
  padding: 25px;
}
.architecture-card h3 {
  margin: 8px 0 0;
  font-family: var(--font-display);
  font-size: 18px;
}
.architecture-card ol {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 9px;
  margin: 0;
  padding: 0;
  list-style: none;
}
.architecture-card li {
  min-width: 130px;
  padding: 15px;
  border-radius: 17px;
  background: var(--canvas);
}
.architecture-card li span {
  display: block;
  color: var(--primary-deep);
  font-size: 9px;
  font-weight: 900;
}
.architecture-card li b {
  display: block;
  margin-top: 22px;
  font-size: 11px;
}
.architecture-card li small {
  display: block;
  margin-top: 5px;
  color: var(--muted);
  font-size: 9px;
}
.pulse-card {
  min-height: 210px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 25px;
  border-radius: 25px;
  color: var(--brand-accent-foreground);
  background: linear-gradient(145deg, var(--brand-accent), var(--primary));
  box-shadow: 0 18px 44px color-mix(in srgb, var(--primary), transparent 84%);
}
.pulse-card > div {
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.18em;
}
.pulse-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 7px;
  border-radius: 50%;
  background: var(--brand-accent-foreground);
  box-shadow: 0 0 0 6px color-mix(in srgb, var(--brand-accent-foreground), transparent 88%);
}
.pulse-card strong {
  font-family: var(--font-display);
  font-size: 38px;
  letter-spacing: -0.06em;
}
.pulse-card p {
  margin: -14px 0 0;
  font-size: 12px;
}
.pulse-card small {
  font-size: 8px;
  letter-spacing: 0.18em;
}
@media (max-width: 1100px) {
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .home-detail-grid {
    grid-template-columns: 1fr;
  }
  .architecture-card {
    flex-direction: column;
  }
}
@media (max-width: 650px) {
  .hero-panel {
    min-height: 380px;
    grid-template-columns: 1fr;
    padding: 26px;
  }
  .hero-index {
    display: none;
  }
  .module-grid {
    grid-template-columns: 1fr 1fr;
  }
  .architecture-card ol {
    grid-template-columns: 1fr;
  }
  .module-card {
    min-height: 150px;
  }
}
</style>
