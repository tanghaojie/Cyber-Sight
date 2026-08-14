<template>
  <section class="home-page" :aria-label="t('home.overview.label')">
    <article class="hero-panel">
      <div class="hero-mesh" aria-hidden="true" />
      <div class="hero-topline">
        <a
          class="hero-brand-link"
          :href="appConfig.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('shared.brand.githubLabel')"
        >
          <CyberLogo :show-descriptor="false" tone="light" />
        </a>
        <span class="hero-kicker"><i />{{ t('home.hero.kicker') }}</span>
        <span class="hero-status"><i />{{ t('home.hero.status') }}</span>
      </div>
      <div class="hero-content">
        <div class="hero-copy">
          <h1>{{ t('home.hero.lineOne') }}<br />{{ t('home.hero.lineTwo') }}</h1>
          <p>{{ t('home.hero.description', { name: appConfig.fullName }) }}</p>
        </div>
        <div class="hero-index">
          <small>{{ t('home.hero.systemIndex') }}</small>
          <b>{{ String(navigation.flatItems.length).padStart(2, '0') }}</b>
          <span>{{ t('home.hero.activeNodes') }}</span>
        </div>
      </div>
      <div class="hero-footer">
        <span class="hero-footer__note">{{ todayLabel }} · {{ t('home.hero.statusDetail') }}</span>
        <div class="hero-footer__actions">
          <div class="hero-notes">
            <span><b>01</b>{{ t('home.hero.stat.structure') }}</span>
            <span><b>02</b>{{ t('home.hero.stat.contract') }}</span>
            <span><b>03</b>{{ t('home.hero.stat.foundation') }}</span>
          </div>
          <a
            class="hero-github-link"
            :href="appConfig.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            <AppIcon name="external" />
            <span>{{ t('home.hero.github') }}</span>
          </a>
        </div>
      </div>
    </article>

    <section class="insight-section" :aria-label="t('home.pillars.title')">
      <div class="section-lead">
        <span>{{ t('home.pillars.label') }}</span>
        <h2>{{ t('home.pillars.title') }}</h2>
      </div>
      <div class="insight-grid">
        <article v-for="pillar in pillars" :key="pillar.id" class="insight-card">
          <div class="insight-card__topline">
            <span class="insight-card__index">{{ pillar.index }}</span>
            <span class="insight-card__icon"><AppIcon :name="pillar.icon" /></span>
          </div>
          <h3>{{ t(pillar.titleKey) }}</h3>
          <p>{{ t(pillar.descriptionKey) }}</p>
        </article>
      </div>
    </section>

    <section class="access-section" :aria-label="t('home.access.title')">
      <div class="section-heading">
        <div>
          <span>{{ t('home.access.label') }}</span>
          <h2>{{ t('home.access.title') }}</h2>
        </div>
        <p>{{ t('home.access.description') }}</p>
      </div>
      <div v-if="quickEntries.length" class="module-grid">
        <template v-for="item in quickEntries" :key="item.id">
          <RouterLink v-if="item.type === 'menu'" :to="item.path" class="module-card">
            <span class="module-card__icon"><AppIcon :name="item.icon" /></span>
            <span class="module-card__arrow">↗</span>
            <b>{{ resolveLocalizedLabel(navigationLabel(item)) }}</b>
            <small>{{ item.path }}</small>
          </RouterLink>
          <a
            v-else
            :href="item.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="module-card"
          >
            <span class="module-card__icon"><AppIcon :name="item.icon || 'external'" /></span>
            <span class="module-card__arrow">↗</span>
            <b>{{ resolveLocalizedLabel(navigationLabel(item)) }}</b>
            <small>{{ t('home.cards.externalResource') }}</small>
          </a>
        </template>
      </div>
      <div v-else class="access-empty">
        <span class="access-empty__icon"><AppIcon name="layers" /></span>
        <div>
          <b>{{ t('home.access.emptyTitle') }}</b>
          <p>{{ t('home.access.emptyDescription') }}</p>
        </div>
      </div>
    </section>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AppIcon from '@/foundation/components/AppIcon.vue'
import CyberLogo from '@/foundation/components/platform/PlatformLogo.vue'
import { usePlatformConfig } from '@/foundation/platform/platform'
import { useLocalization } from '@/foundation/modules/localization/localization'
import { navigationLabel } from '@/foundation/modules/navigation/navigation.labels'
import { useNavigationStore } from '@/foundation/modules/navigation/navigation.store'

const navigation = useNavigationStore()
const { formatDateTime, resolveLocalizedLabel, t } = useLocalization()
const appConfig = usePlatformConfig()
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
const pillars = [
  {
    id: 'structure',
    index: '01',
    icon: 'layers',
    titleKey: 'home.pillars.structure.title',
    descriptionKey: 'home.pillars.structure.description',
  },
  {
    id: 'contract',
    index: '02',
    icon: 'link',
    titleKey: 'home.pillars.contract.title',
    descriptionKey: 'home.pillars.contract.description',
  },
  {
    id: 'evolution',
    index: '03',
    icon: 'activity',
    titleKey: 'home.pillars.evolution.title',
    descriptionKey: 'home.pillars.evolution.description',
  },
] as const
</script>

<style scoped>
.home-page {
  width: min(100%, 1480px);
  display: grid;
  gap: 28px;
  margin: 0 auto;
}

.hero-panel {
  position: relative;
  min-height: 386px;
  display: grid;
  grid-template-rows: auto 1fr auto;
  overflow: hidden;
  padding: 28px 34px 25px;
  border: 1px solid color-mix(in srgb, var(--hero-foreground), transparent 84%);
  border-radius: 30px;
  color: var(--hero-foreground);
  background:
    radial-gradient(
      circle at 85% 12%,
      color-mix(in srgb, var(--brand-node), transparent 82%),
      transparent 28%
    ),
    linear-gradient(135deg, var(--hero-start), var(--hero-end) 76%);
  box-shadow: 0 25px 70px color-mix(in srgb, var(--hero-start), transparent 68%);
}

.hero-mesh {
  position: absolute;
  inset: 0;
  opacity: 0.62;
  pointer-events: none;
  background-image:
    linear-gradient(color-mix(in srgb, var(--brand-accent), transparent 89%) 1px, transparent 1px),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--brand-accent), transparent 89%) 1px,
      transparent 1px
    ),
    linear-gradient(
      120deg,
      transparent 0 61%,
      color-mix(in srgb, var(--hero-foreground), transparent 95%) 61%
    );
  background-size:
    42px 42px,
    42px 42px,
    100% 100%;
  mask-image: linear-gradient(135deg, #000 20%, transparent 84%);
}

.hero-topline,
.hero-content,
.hero-footer {
  position: relative;
  z-index: 1;
}

.hero-topline,
.hero-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.hero-topline {
  padding-bottom: 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--hero-foreground), transparent 87%);
  color: var(--hero-meta);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.hero-brand-link {
  display: inline-flex;
  flex: 0 0 auto;
  border-radius: 14px;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.hero-brand-link:hover,
.hero-brand-link:focus-visible {
  outline: 0;
  filter: drop-shadow(0 0 14px color-mix(in srgb, var(--brand-accent), transparent 45%));
  transform: translateY(-2px);
}

.hero-brand-link :deep(.cyber-logo) {
  --cyber-logo-mark-size: 31px;
  --cyber-logo-wordmark-size: 12px;
}

.hero-kicker,
.hero-status {
  display: inline-flex;
  align-items: center;
  gap: 9px;
}

.hero-kicker i,
.hero-status i {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--brand-accent);
  box-shadow: 0 0 14px var(--brand-accent);
}

.hero-status {
  color: var(--brand-accent);
}

.hero-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 32px;
  padding: 32px 0 25px;
}

.hero-copy {
  max-width: 810px;
}

.hero-copy h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(38px, 4.5vw, 62px);
  font-weight: 820;
  letter-spacing: -0.06em;
  line-height: 1.06;
  text-wrap: balance;
}

.hero-copy p {
  max-width: 700px;
  margin: 24px 0 0;
  color: var(--hero-muted);
  font-size: 13px;
  line-height: 1.8;
}

.hero-index {
  display: grid;
  justify-items: end;
  padding-left: 34px;
  border-left: 1px solid color-mix(in srgb, var(--hero-foreground), transparent 84%);
}

.hero-index small,
.hero-index span {
  color: var(--hero-meta);
  font-size: 8px;
  letter-spacing: 0.18em;
}

.hero-index b {
  margin: 6px 0 2px;
  font-family: var(--font-display);
  font-size: 72px;
  letter-spacing: -0.09em;
  line-height: 0.9;
}

.hero-footer {
  padding-top: 17px;
  border-top: 1px solid color-mix(in srgb, var(--hero-foreground), transparent 87%);
}

.hero-footer__actions {
  display: flex;
  align-items: center;
  gap: 22px;
}

.hero-footer__note {
  color: var(--hero-meta);
  font-size: 8px;
  font-weight: 760;
  letter-spacing: 0.13em;
}

.hero-notes {
  display: flex;
  gap: 22px;
}

.hero-notes span {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--hero-muted);
  font-size: 9px;
}

.hero-notes b {
  color: var(--brand-accent);
  font-size: 8px;
  letter-spacing: 0.1em;
}

.hero-github-link {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  color: var(--brand-accent);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-decoration: none;
  transition:
    color 0.18s ease,
    transform 0.18s ease;
}

.hero-github-link:hover,
.hero-github-link:focus-visible {
  outline: 0;
  color: var(--hero-foreground);
  transform: translateY(-2px);
}

.hero-github-link :deep(svg) {
  width: 14px;
  height: 14px;
}

.insight-section {
  display: grid;
  grid-template-columns: 0.36fr 1.64fr;
  gap: 20px;
  align-items: stretch;
}

.section-lead,
.section-heading {
  padding: 4px 0;
}

.section-lead > span,
.section-heading > div > span {
  color: var(--primary-deep);
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.2em;
}

.section-lead h2,
.section-heading h2 {
  margin: 12px 0 0;
  font-family: var(--font-display);
  font-size: clamp(23px, 2.4vw, 32px);
  letter-spacing: -0.05em;
  line-height: 1.05;
}

.insight-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.insight-card {
  min-height: 176px;
  display: grid;
  align-content: start;
  padding: 19px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: color-mix(in srgb, var(--surface), transparent 7%);
  box-shadow: 0 15px 40px color-mix(in srgb, var(--ink), transparent 97%);
}

.insight-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.insight-card__index {
  color: var(--primary-deep);
  font-size: 8px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.insight-card__icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 11px;
  color: var(--primary-deep);
  background: var(--primary-mist);
}

.insight-card h3 {
  margin: 23px 0 0;
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: -0.02em;
  line-height: 1.3;
}

.insight-card p {
  margin: 9px 0 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.65;
}

.access-section {
  display: grid;
  gap: 17px;
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 28px;
  padding-bottom: 17px;
  border-bottom: 1px solid var(--line);
}

.section-heading h2 {
  margin-top: 8px;
}

.section-heading p {
  max-width: 310px;
  margin: 0;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.6;
  text-align: right;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.module-card {
  min-height: 154px;
  display: grid;
  grid-template-columns: 1fr auto;
  align-content: space-between;
  padding: 18px;
  border: 1px solid var(--line);
  border-radius: 19px;
  background: color-mix(in srgb, var(--surface), transparent 9%);
  box-shadow: 0 15px 40px color-mix(in srgb, var(--ink), transparent 97%);
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.module-card:hover {
  transform: translateY(-4px);
  border-color: var(--primary);
  box-shadow: 0 20px 50px color-mix(in srgb, var(--primary), transparent 88%);
}

.module-card__icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  color: var(--primary-deep);
  background: var(--primary-mist);
}

.module-card__arrow {
  color: var(--muted);
  transition: transform 0.2s ease;
}

.module-card:hover .module-card__arrow {
  transform: translate(2px, -2px);
  color: var(--primary-deep);
}

.module-card b {
  grid-column: 1/-1;
  align-self: end;
  margin-top: 24px;
  font-family: var(--font-display);
  font-size: 15px;
}

.module-card small {
  grid-column: 1/-1;
  margin-top: 5px;
  overflow: hidden;
  color: var(--muted);
  font-size: 8px;
  letter-spacing: 0.11em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.access-empty {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px;
  border: 1px dashed var(--line);
  border-radius: 19px;
  background: color-mix(in srgb, var(--surface), transparent 22%);
}

.access-empty__icon {
  display: grid;
  width: 40px;
  height: 40px;
  place-items: center;
  border-radius: 13px;
  color: var(--muted);
  background: var(--surface-muted);
}

.access-empty b {
  font-family: var(--font-display);
  font-size: 14px;
}

.access-empty p {
  margin: 5px 0 0;
  color: var(--muted);
  font-size: 11px;
}

@media (max-width: 1120px) {
  .insight-section {
    grid-template-columns: 1fr;
  }

  .section-lead {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
  }

  .section-lead h2 {
    margin: 0;
  }

  .module-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .hero-panel {
    min-height: 420px;
    padding: 23px 23px 20px;
    border-radius: 24px;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 27px 0 24px;
  }

  .hero-index {
    display: flex;
    align-items: baseline;
    justify-content: flex-start;
    gap: 10px;
    padding: 15px 0 0;
    border-top: 1px solid color-mix(in srgb, var(--hero-foreground), transparent 84%);
    border-left: 0;
  }

  .hero-index b {
    margin: 0;
    font-size: 46px;
  }

  .hero-footer {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .hero-notes {
    flex-wrap: wrap;
    gap: 10px 18px;
  }

  .hero-footer__actions {
    align-items: flex-start;
    flex-direction: column;
    gap: 13px;
  }

  .insight-grid {
    grid-template-columns: 1fr;
  }

  .insight-card {
    min-height: 0;
  }

  .section-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 9px;
  }

  .section-heading p {
    text-align: left;
  }
}

@media (max-width: 520px) {
  .home-page {
    gap: 22px;
  }

  .hero-topline {
    align-items: flex-start;
    flex-direction: column;
    gap: 10px;
  }

  .hero-copy h1 {
    font-size: clamp(34px, 10vw, 45px);
  }

  .hero-copy p {
    margin-top: 19px;
    font-size: 12px;
  }

  .module-grid {
    grid-template-columns: 1fr;
  }
}
</style>
