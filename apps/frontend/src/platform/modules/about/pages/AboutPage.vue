<template>
  <main class="about-page" :aria-label="t('about.pageLabel')">
    <section class="about-hero">
      <div class="about-hero__grid" aria-hidden="true" />
      <div class="about-hero__orb about-hero__orb--large" aria-hidden="true" />
      <div class="about-hero__orb about-hero__orb--small" aria-hidden="true" />
      <div class="about-hero__rail about-hero__rail--one" aria-hidden="true" />
      <div class="about-hero__rail about-hero__rail--two" aria-hidden="true" />

      <header class="about-hero__topline">
        <a
          class="about-brand-link"
          :href="appConfig.githubUrl"
          target="_blank"
          rel="noopener noreferrer"
          :aria-label="t('shared.brand.githubLabel')"
        >
          <CyberLogo tone="light" :show-descriptor="false" />
        </a>
        <span class="about-hero__code">SYS / ABOUT / 01</span>
      </header>

      <div class="about-hero__body">
        <div class="about-hero__copy">
          <p class="about-eyebrow"><i />{{ t('about.hero.kicker') }}</p>
          <h1>
            {{ t('about.hero.titleOne') }}<br /><em>{{ t('about.hero.titleTwo') }}</em>
          </h1>
          <p class="about-hero__description">{{ t('about.hero.description') }}</p>
          <div class="about-hero__actions">
            <a
              class="about-button about-button--primary"
              :href="appConfig.githubUrl"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{{ t('about.hero.github') }}</span>
              <AppIcon name="external" />
            </a>
            <RouterLink class="about-button about-button--quiet" to="/">
              <AppIcon name="home" />
              <span>{{ t('about.hero.backHome') }}</span>
            </RouterLink>
          </div>
        </div>

        <div class="blueprint-visual" aria-hidden="true">
          <div class="blueprint-visual__halo" />
          <div class="blueprint-visual__orbit blueprint-visual__orbit--one"><i /></div>
          <div class="blueprint-visual__orbit blueprint-visual__orbit--two"><i /></div>
          <div class="blueprint-visual__core">
            <CyberLogo tone="light" icon-only />
            <span>CYBER</span>
          </div>
          <div class="blueprint-visual__node blueprint-visual__node--one"><i />01</div>
          <div class="blueprint-visual__node blueprint-visual__node--two"><i />02</div>
          <div class="blueprint-visual__node blueprint-visual__node--three"><i />03</div>
          <span class="blueprint-visual__label blueprint-visual__label--top">AI / HUMAN</span>
          <span class="blueprint-visual__label blueprint-visual__label--bottom"
            >BUILD / EVOLVE</span
          >
        </div>
      </div>

      <footer class="about-hero__footer">
        <span><i />{{ t('about.hero.systemReady') }}</span>
        <span>{{ t('about.hero.productLabel') }}</span>
        <span>{{ t('about.hero.creator') }}</span>
      </footer>
    </section>

    <section class="about-section about-principles">
      <div class="about-section__intro">
        <p class="about-section__eyebrow">{{ t('about.principles.eyebrow') }}</p>
        <h2>{{ t('about.principles.title') }}</h2>
        <p>{{ t('about.principles.description') }}</p>
      </div>
      <div class="principle-grid">
        <article v-for="principle in principles" :key="principle.id" class="principle-card">
          <div class="principle-card__topline">
            <span>{{ principle.index }}</span>
            <AppIcon :name="principle.icon" />
          </div>
          <h3>{{ t(principle.title) }}</h3>
          <p>{{ t(principle.detail) }}</p>
          <div class="principle-card__line" aria-hidden="true" />
        </article>
      </div>
    </section>

    <section class="about-section audience-section">
      <div class="section-heading">
        <div>
          <p class="about-section__eyebrow">{{ t('about.audience.eyebrow') }}</p>
          <h2>{{ t('about.audience.title') }}</h2>
        </div>
        <p>{{ t('about.audience.description') }}</p>
      </div>
      <div class="audience-layout">
        <div class="audience-card-grid">
          <article v-for="audience in audiences" :key="audience.id" class="audience-card">
            <div class="audience-card__icon"><AppIcon :name="audience.icon" /></div>
            <div>
              <p class="audience-card__label">{{ t(audience.label) }}</p>
              <h3>{{ t(audience.title) }}</h3>
              <p>{{ t(audience.detail) }}</p>
            </div>
          </article>
        </div>
        <aside class="audience-aside">
          <span class="flow-signal"><i />{{ t('about.audience.noteLabel') }}</span>
          <strong>{{ t('about.audience.noteTitle') }}</strong>
          <p>{{ t('about.audience.noteDetail') }}</p>
        </aside>
      </div>
      <div class="scenario-heading">
        <div>
          <p class="about-section__eyebrow">{{ t('about.scenarios.eyebrow') }}</p>
          <h3>{{ t('about.scenarios.title') }}</h3>
        </div>
        <span>{{ t('about.scenarios.count') }}</span>
      </div>
      <div class="scenario-grid">
        <article v-for="scenario in scenarios" :key="scenario.id" class="scenario-card">
          <span class="scenario-card__index">{{ scenario.index }}</span>
          <h4>{{ t(scenario.title) }}</h4>
          <p>{{ t(scenario.detail) }}</p>
        </article>
      </div>
    </section>

    <section class="about-section comparison-section">
      <div class="section-heading section-heading--split">
        <div>
          <p class="about-section__eyebrow">{{ t('about.comparison.eyebrow') }}</p>
          <h2>{{ t('about.comparison.title') }}</h2>
        </div>
        <p>{{ t('about.comparison.description') }}</p>
      </div>
      <div class="comparison-table-wrap">
        <table class="comparison-table">
          <thead>
            <tr>
              <th scope="col">{{ t('about.comparison.dimension') }}</th>
              <th scope="col">{{ t('about.comparison.zero') }}</th>
              <th scope="col" class="comparison-table__featured">
                {{ t('about.comparison.cyber') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in comparisonRows" :key="row.id">
              <th scope="row">{{ t(row.label) }}</th>
              <td>{{ t(row.zero) }}</td>
              <td class="comparison-table__featured">{{ t(row.cyber) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <blockquote class="comparison-quote">{{ t('about.comparison.quote') }}</blockquote>
    </section>

    <section class="about-section blueprint-section">
      <div class="section-heading section-heading--split">
        <div>
          <p class="about-section__eyebrow">{{ t('about.blueprint.eyebrow') }}</p>
          <h2>{{ t('about.blueprint.title') }}</h2>
        </div>
        <p>{{ t('about.blueprint.description') }}</p>
      </div>
      <div class="blueprint-flow">
        <div class="blueprint-flow__aside">
          <span class="flow-signal"><i />01 / INPUT</span>
          <strong>{{ t('about.blueprint.human') }}</strong>
          <small>{{ t('about.blueprint.ai') }}</small>
        </div>
        <div class="blueprint-flow__layers">
          <div v-for="layer in layers" :key="layer.id" class="blueprint-layer">
            <span class="blueprint-layer__index">{{ layer.index }}</span>
            <span class="blueprint-layer__name">{{ t(layer.label) }}</span>
            <span class="blueprint-layer__bar"><i /></span>
            <span class="blueprint-layer__tech">{{ t(layer.tech) }}</span>
          </div>
        </div>
        <div class="blueprint-flow__aside blueprint-flow__aside--end">
          <span class="flow-signal"><i />05 / OUTPUT</span>
          <strong>{{ t('about.blueprint.database') }}</strong>
          <small>{{ t('about.blueprint.backend') }}</small>
        </div>
      </div>
    </section>

    <section class="about-section stack-section">
      <div class="section-heading">
        <div>
          <p class="about-section__eyebrow">{{ t('about.stack.eyebrow') }}</p>
          <h2>{{ t('about.stack.title') }}</h2>
        </div>
        <p>{{ t('about.stack.description') }}</p>
      </div>
      <div class="stack-grid">
        <article v-for="item in stack" :key="item.id" class="stack-card">
          <span class="stack-card__icon"><AppIcon :name="item.icon" /></span>
          <div>
            <h3>{{ t(item.title) }}</h3>
            <p>{{ t(item.detail) }}</p>
          </div>
          <span class="stack-card__arrow">↗</span>
        </article>
      </div>
    </section>

    <section class="about-cta">
      <div class="about-cta__mesh" aria-hidden="true" />
      <div class="about-cta__copy">
        <p class="about-section__eyebrow">{{ t('about.cta.eyebrow') }}</p>
        <h2>{{ t('about.cta.title') }}</h2>
        <p>{{ t('about.cta.description') }}</p>
      </div>
      <a
        class="about-button about-button--primary about-cta__button"
        :href="appConfig.githubUrl"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>{{ t('about.cta.github') }}</span>
        <AppIcon name="external" />
      </a>
    </section>

    <footer class="about-footer">
      <CyberLogo tone="dark" :show-descriptor="false" />
      <span>{{ t('about.footer.creator') }}</span>
      <a :href="appConfig.githubUrl" target="_blank" rel="noopener noreferrer">
        GitHub <AppIcon name="external" />
      </a>
    </footer>
  </main>
</template>

<script setup lang="ts">
import AppIcon from '@/foundation/components/AppIcon.vue'
import CyberLogo from '@/foundation/components/platform/PlatformLogo.vue'
import { usePlatformConfig } from '@/foundation/platform/platform'
import { useLocalization } from '@/foundation/modules/localization/localization'

const { t } = useLocalization()
const appConfig = usePlatformConfig()

const principles = [
  {
    id: 'structure',
    index: '01',
    icon: 'layers',
    title: 'about.principles.structure.title',
    detail: 'about.principles.structure.detail',
  },
  {
    id: 'contract',
    index: '02',
    icon: 'link',
    title: 'about.principles.contract.title',
    detail: 'about.principles.contract.detail',
  },
  {
    id: 'context',
    index: '03',
    icon: 'book',
    title: 'about.principles.context.title',
    detail: 'about.principles.context.detail',
  },
  {
    id: 'fullstack',
    index: '04',
    icon: 'activity',
    title: 'about.principles.fullstack.title',
    detail: 'about.principles.fullstack.detail',
  },
  {
    id: 'foundation',
    index: '05',
    icon: 'shield',
    title: 'about.principles.foundation.title',
    detail: 'about.principles.foundation.detail',
  },
] as const

const audiences = [
  {
    id: 'maker',
    icon: 'user',
    label: 'about.audience.maker.label',
    title: 'about.audience.maker.title',
    detail: 'about.audience.maker.detail',
  },
  {
    id: 'developer',
    icon: 'wrench',
    label: 'about.audience.developer.label',
    title: 'about.audience.developer.title',
    detail: 'about.audience.developer.detail',
  },
] as const

const scenarios = [
  {
    id: 'internal',
    index: '01',
    title: 'about.scenarios.internal.title',
    detail: 'about.scenarios.internal.detail',
  },
  {
    id: 'crm',
    index: '02',
    title: 'about.scenarios.crm.title',
    detail: 'about.scenarios.crm.detail',
  },
  {
    id: 'operations',
    index: '03',
    title: 'about.scenarios.operations.title',
    detail: 'about.scenarios.operations.detail',
  },
  {
    id: 'content',
    index: '04',
    title: 'about.scenarios.content.title',
    detail: 'about.scenarios.content.detail',
  },
  {
    id: 'project',
    index: '05',
    title: 'about.scenarios.project.title',
    detail: 'about.scenarios.project.detail',
  },
  {
    id: 'knowledge',
    index: '06',
    title: 'about.scenarios.knowledge.title',
    detail: 'about.scenarios.knowledge.detail',
  },
  {
    id: 'saas',
    index: '07',
    title: 'about.scenarios.saas.title',
    detail: 'about.scenarios.saas.detail',
  },
  {
    id: 'prototype',
    index: '08',
    title: 'about.scenarios.prototype.title',
    detail: 'about.scenarios.prototype.detail',
  },
] as const

const comparisonRows = [
  {
    id: 'startingPoint',
    label: 'about.comparison.row.startingPoint.label',
    zero: 'about.comparison.row.startingPoint.zero',
    cyber: 'about.comparison.row.startingPoint.cyber',
  },
  {
    id: 'context',
    label: 'about.comparison.row.context.label',
    zero: 'about.comparison.row.context.zero',
    cyber: 'about.comparison.row.context.cyber',
  },
  {
    id: 'foundation',
    label: 'about.comparison.row.foundation.label',
    zero: 'about.comparison.row.foundation.zero',
    cyber: 'about.comparison.row.foundation.cyber',
  },
  {
    id: 'location',
    label: 'about.comparison.row.location.label',
    zero: 'about.comparison.row.location.zero',
    cyber: 'about.comparison.row.location.cyber',
  },
  {
    id: 'collaboration',
    label: 'about.comparison.row.collaboration.label',
    zero: 'about.comparison.row.collaboration.zero',
    cyber: 'about.comparison.row.collaboration.cyber',
  },
  {
    id: 'outcome',
    label: 'about.comparison.row.outcome.label',
    zero: 'about.comparison.row.outcome.zero',
    cyber: 'about.comparison.row.outcome.cyber',
  },
] as const

const layers = [
  { id: 'human', index: '01', label: 'about.blueprint.layer.human', tech: 'about.blueprint.human' },
  {
    id: 'interface',
    index: '02',
    label: 'about.blueprint.layer.interface',
    tech: 'about.blueprint.frontend',
  },
  {
    id: 'contract',
    index: '03',
    label: 'about.blueprint.layer.contract',
    tech: 'about.blueprint.contract',
  },
  {
    id: 'service',
    index: '04',
    label: 'about.blueprint.layer.service',
    tech: 'about.blueprint.backend',
  },
  {
    id: 'data',
    index: '05',
    label: 'about.blueprint.layer.data',
    tech: 'about.blueprint.database',
  },
] as const

const stack = [
  {
    id: 'frontend',
    icon: 'monitor',
    title: 'about.stack.frontend',
    detail: 'about.stack.frontendDetail',
  },
  {
    id: 'backend',
    icon: 'shield',
    title: 'about.stack.backend',
    detail: 'about.stack.backendDetail',
  },
  { id: 'data', icon: 'database', title: 'about.stack.data', detail: 'about.stack.dataDetail' },
] as const
</script>

<style scoped>
.about-page {
  --about-ink: var(--ink);
  --about-ink-soft: var(--ink-soft);
  --about-muted: var(--muted);
  --about-line: var(--line);
  --about-accent: var(--brand-accent);
  --about-accent-foreground: var(--brand-accent-foreground);
  --about-purple: var(--brand-node);
  --about-hero-start: var(--hero-start);
  --about-hero-end: var(--hero-end);
  --about-hero-foreground: var(--hero-foreground);
  --about-hero-muted: var(--hero-muted);
  --about-hero-meta: var(--hero-meta);
  width: min(100%, 1480px);
  display: grid;
  gap: 30px;
  margin: 0 auto;
  padding-bottom: 16px;
}

.about-hero {
  position: relative;
  isolation: isolate;
  min-height: 610px;
  overflow: hidden;
  padding: 30px 38px 25px;
  border: 1px solid color-mix(in srgb, var(--about-hero-foreground), transparent 88%);
  border-radius: 32px;
  color: var(--about-hero-foreground);
  background:
    radial-gradient(
      circle at 74% 45%,
      color-mix(in srgb, var(--about-accent), transparent 84%),
      transparent 23%
    ),
    radial-gradient(
      circle at 20% 0%,
      color-mix(in srgb, var(--about-purple), transparent 82%),
      transparent 32%
    ),
    linear-gradient(
      135deg,
      var(--about-hero-end) 0%,
      var(--about-hero-start) 62%,
      var(--about-hero-end) 100%
    );
  box-shadow: 0 28px 80px color-mix(in srgb, var(--about-hero-end), transparent 78%);
}

.about-hero::after {
  position: absolute;
  z-index: -1;
  top: -30%;
  right: -15%;
  width: min(56vw, 760px);
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--about-accent), transparent 82%);
  border-radius: 50%;
  box-shadow:
    0 0 0 72px color-mix(in srgb, var(--about-accent), transparent 96.5%),
    0 0 0 156px color-mix(in srgb, var(--about-purple), transparent 97%);
  content: '';
  transform: rotate(-18deg);
}

.about-hero__grid,
.about-hero__rail,
.about-hero__orb {
  position: absolute;
  pointer-events: none;
}

.about-hero__grid {
  z-index: -1;
  inset: 0;
  opacity: 0.58;
  background-image:
    linear-gradient(color-mix(in srgb, var(--about-accent), transparent 92%) 1px, transparent 1px),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--about-accent), transparent 92%) 1px,
      transparent 1px
    );
  background-size: 44px 44px;
  mask-image: linear-gradient(115deg, #000 14%, transparent 75%);
  animation: about-grid-flow 18s linear infinite;
}

.about-hero__orb {
  z-index: -1;
  border-radius: 50%;
  filter: blur(1px);
}

.about-hero__orb--large {
  top: 24%;
  right: 11%;
  width: 360px;
  height: 360px;
  border: 1px solid color-mix(in srgb, var(--about-accent), transparent 82%);
  box-shadow:
    inset 0 0 60px color-mix(in srgb, var(--about-accent), transparent 96%),
    0 0 80px color-mix(in srgb, var(--about-accent), transparent 94%);
  animation: about-orb-breathe 8s ease-in-out infinite;
}

.about-hero__orb--small {
  top: 17%;
  right: 35%;
  width: 10px;
  height: 10px;
  background: var(--about-purple);
  box-shadow: 0 0 25px var(--about-purple);
  animation: about-node-pulse 4s ease-in-out infinite;
}

.about-hero__rail {
  z-index: -1;
  opacity: 0.55;
  background: linear-gradient(90deg, transparent, var(--about-accent), transparent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--about-accent), transparent 40%);
}

.about-hero__rail--one {
  top: 39%;
  right: 0;
  width: 52%;
  height: 1px;
  animation: about-rail-scan 6s ease-in-out infinite;
}

.about-hero__rail--two {
  top: 39%;
  right: 16%;
  width: 1px;
  height: 42%;
  background: linear-gradient(transparent, var(--about-purple), transparent);
  box-shadow: 0 0 20px color-mix(in srgb, var(--about-purple), transparent 40%);
}

.about-hero__topline,
.about-hero__body,
.about-hero__footer {
  position: relative;
  z-index: 1;
}

.about-hero__topline,
.about-hero__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}

.about-hero__topline {
  padding-bottom: 25px;
  border-bottom: 1px solid color-mix(in srgb, var(--about-hero-foreground), transparent 87%);
}

.about-brand-link {
  display: inline-flex;
  border-radius: 16px;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;
}

.about-brand-link:hover,
.about-brand-link:focus-visible {
  outline: 0;
  filter: drop-shadow(0 0 16px color-mix(in srgb, var(--about-accent), transparent 64%));
  transform: translateY(-2px);
}

.about-brand-link :deep(.cyber-logo) {
  --cyber-logo-mark-size: 42px;
  --cyber-logo-wordmark-size: 15px;
}

.about-hero__code,
.about-hero__footer,
.about-eyebrow,
.about-section__eyebrow,
.flow-signal {
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.about-hero__code {
  color: var(--about-accent);
}

.about-hero__body {
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(400px, 1.08fr);
  align-items: center;
  gap: 20px;
  min-height: 460px;
}

.about-hero__copy {
  max-width: 650px;
  animation: about-rise 0.8s ease both;
}

.about-eyebrow {
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 23px;
  color: var(--about-accent);
}

.about-eyebrow i,
.about-hero__footer i,
.flow-signal i {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  box-shadow: 0 0 14px currentColor;
}

.about-hero__copy h1 {
  margin: 0;
  font-family: var(--font-display);
  font-size: clamp(48px, 5vw, 78px);
  font-weight: 820;
  letter-spacing: -0.07em;
  line-height: 1.03;
  text-wrap: balance;
}

.about-hero__copy h1 em {
  color: var(--about-accent);
  font-style: normal;
  text-shadow: 0 0 36px color-mix(in srgb, var(--about-accent), transparent 64%);
}

.about-hero__description {
  max-width: 570px;
  margin: 26px 0 0;
  color: var(--about-hero-muted);
  font-size: 13px;
  line-height: 1.85;
}

.about-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 30px;
}

.about-button {
  display: inline-flex;
  min-height: 46px;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 16px;
  border: 1px solid transparent;
  border-radius: 13px;
  font-size: 11px;
  font-weight: 800;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;
}

.about-button:hover,
.about-button:focus-visible {
  outline: 0;
  transform: translateY(-3px);
}

.about-button--primary {
  color: var(--about-accent-foreground);
  background: var(--about-accent);
  box-shadow: 0 12px 28px color-mix(in srgb, var(--about-accent), transparent 83%);
}

.about-button--primary:hover,
.about-button--primary:focus-visible {
  background: color-mix(in srgb, var(--about-accent), var(--about-hero-foreground) 18%);
  box-shadow: 0 16px 34px color-mix(in srgb, var(--about-accent), transparent 75%);
}

.about-button--quiet {
  color: color-mix(in srgb, var(--about-hero-foreground), transparent 22%);
  border-color: color-mix(in srgb, var(--about-hero-foreground), transparent 84%);
  background: color-mix(in srgb, var(--about-hero-foreground), transparent 95%);
}

.about-button--quiet:hover,
.about-button--quiet:focus-visible {
  border-color: color-mix(in srgb, var(--about-accent), transparent 56%);
  background: color-mix(in srgb, var(--about-accent), transparent 90%);
}

.blueprint-visual {
  position: relative;
  width: min(100%, 560px);
  height: 430px;
  margin: 0 auto;
  perspective: 900px;
  animation: about-rise 0.9s 0.15s ease both;
}

.blueprint-visual__halo,
.blueprint-visual__orbit {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
}

.blueprint-visual__halo {
  top: 61px;
  right: 60px;
  width: 330px;
  aspect-ratio: 1;
  background: radial-gradient(
    circle,
    color-mix(in srgb, var(--about-accent), transparent 87%),
    color-mix(in srgb, var(--about-purple), transparent 96%) 46%,
    transparent 70%
  );
  filter: blur(6px);
  animation: about-halo-breathe 7s ease-in-out infinite;
}

.blueprint-visual__orbit {
  top: 73px;
  right: 70px;
  width: 310px;
  aspect-ratio: 1;
  border: 1px solid color-mix(in srgb, var(--about-accent), transparent 64%);
  transform: rotateX(66deg) rotateZ(-22deg);
  transform-style: preserve-3d;
  animation: about-orbit-one 10s linear infinite;
}

.blueprint-visual__orbit--two {
  inset: 105px 106px auto auto;
  width: 238px;
  border-color: color-mix(in srgb, var(--about-purple), transparent 50%);
  transform: rotateY(67deg) rotateZ(22deg);
  animation: about-orbit-two 13s linear infinite;
}

.blueprint-visual__orbit i {
  position: absolute;
  top: 50%;
  left: -4px;
  width: 8px;
  height: 8px;
  border: 1px solid var(--about-hero-foreground);
  border-radius: 2px;
  background: var(--about-accent);
  box-shadow: 0 0 16px var(--about-accent);
  transform: translateY(-50%);
}

.blueprint-visual__orbit--two i {
  top: auto;
  right: -4px;
  bottom: 20%;
  left: auto;
  background: var(--about-purple);
  box-shadow: 0 0 16px var(--about-purple);
}

.blueprint-visual__core {
  position: absolute;
  top: 154px;
  right: 160px;
  display: grid;
  width: 132px;
  height: 132px;
  place-items: center;
  align-content: center;
  gap: 2px;
  border: 1px solid color-mix(in srgb, var(--about-hero-foreground), transparent 52%);
  border-radius: 50%;
  background: radial-gradient(
    circle at 37% 26%,
    color-mix(in srgb, var(--about-hero-foreground), transparent 4%),
    color-mix(in srgb, var(--about-accent), transparent 70%) 18%,
    color-mix(in srgb, var(--about-hero-end), transparent 6%) 62%
  );
  box-shadow:
    0 0 30px color-mix(in srgb, var(--about-accent), transparent 60%),
    inset 0 0 30px color-mix(in srgb, var(--about-accent), transparent 76%);
  transform: translateZ(40px);
  animation: about-core-pulse 4s ease-in-out infinite;
}

.blueprint-visual__core :deep(.cyber-logo) {
  --cyber-logo-mark-size: 48px;
}

.blueprint-visual__core span {
  color: color-mix(in srgb, var(--about-hero-foreground), transparent 28%);
  font-family: var(--font-display);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.24em;
}

.blueprint-visual__node {
  position: absolute;
  display: flex;
  align-items: center;
  gap: 7px;
  color: color-mix(in srgb, var(--about-hero-foreground), transparent 34%);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.16em;
}

.blueprint-visual__node i {
  width: 7px;
  height: 7px;
  border-radius: 1px;
  background: var(--about-accent);
  box-shadow: 0 0 15px var(--about-accent);
}

.blueprint-visual__node--one {
  top: 57px;
  left: 49px;
}

.blueprint-visual__node--two {
  top: 253px;
  right: 7px;
}

.blueprint-visual__node--two i {
  background: var(--about-purple);
  box-shadow: 0 0 15px var(--about-purple);
}

.blueprint-visual__node--three {
  bottom: 46px;
  left: 129px;
}

.blueprint-visual__node--three i {
  background: var(--about-hero-foreground);
  box-shadow: 0 0 15px var(--about-hero-foreground);
}

.blueprint-visual__label {
  position: absolute;
  color: color-mix(in srgb, var(--about-hero-foreground), transparent 63%);
  font-size: 8px;
  font-weight: 750;
  letter-spacing: 0.2em;
}

.blueprint-visual__label--top {
  top: 20px;
  right: 31px;
}

.blueprint-visual__label--bottom {
  right: 74px;
  bottom: 16px;
}

.about-hero__footer {
  padding-top: 17px;
  border-top: 1px solid color-mix(in srgb, var(--about-hero-foreground), transparent 87%);
  color: color-mix(in srgb, var(--about-hero-foreground), transparent 58%);
}

.about-hero__footer span {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.about-hero__footer span:first-child {
  color: var(--about-accent);
}

.about-section {
  display: grid;
  gap: 24px;
}

.about-principles {
  grid-template-columns: minmax(220px, 0.72fr) minmax(0, 1.8fr);
  gap: 30px;
  padding: 15px 2px 0;
}

.about-section__intro {
  padding-top: 5px;
}

.about-section__eyebrow {
  margin: 0;
  color: var(--primary-deep);
}

.about-section h2 {
  margin: 12px 0 0;
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: clamp(26px, 3vw, 40px);
  letter-spacing: -0.055em;
  line-height: 1.05;
  text-wrap: balance;
}

.about-section__intro > p:last-child,
.section-heading > p {
  color: var(--about-muted);
  font-size: 11px;
  line-height: 1.75;
}

.about-section__intro > p:last-child {
  max-width: 230px;
  margin: 18px 0 0;
}

.principle-grid,
.stack-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.principle-card,
.stack-card {
  border: 1px solid var(--about-line);
  background: color-mix(in srgb, var(--surface), transparent 10%);
  box-shadow: 0 18px 42px color-mix(in srgb, var(--ink), transparent 96%);
}

.principle-card {
  position: relative;
  min-height: 222px;
  display: grid;
  align-content: start;
  padding: 20px;
  overflow: hidden;
  border-radius: 20px;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.principle-card:hover {
  border-color: color-mix(in srgb, var(--primary), transparent 62%);
  box-shadow: 0 24px 46px color-mix(in srgb, var(--primary), transparent 90%);
  transform: translateY(-5px);
}

.principle-card::after {
  position: absolute;
  right: -20px;
  bottom: -32px;
  width: 100px;
  height: 100px;
  border: 1px solid color-mix(in srgb, var(--about-accent), transparent 82%);
  border-radius: 50%;
  content: '';
}

.principle-card__topline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--primary-deep);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.15em;
}

.principle-card__topline svg {
  width: 19px;
  height: 19px;
}

.principle-card h3 {
  margin: 43px 0 0;
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: -0.02em;
}

.principle-card p {
  max-width: 220px;
  margin: 9px 0 0;
  color: var(--about-muted);
  font-size: 11px;
  line-height: 1.7;
}

.principle-card__line {
  width: 38px;
  height: 2px;
  margin-top: 22px;
  background: var(--about-accent);
}

.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 30px;
  padding: 0 2px 17px;
  border-bottom: 1px solid var(--about-line);
}

.section-heading > p {
  max-width: 300px;
  margin: 0;
  text-align: right;
}

.section-heading--split {
  align-items: center;
}

.audience-section,
.comparison-section {
  padding: 25px 0 0;
}

.audience-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(250px, 0.75fr);
  gap: 14px;
}

.audience-card-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.audience-card,
.audience-aside,
.scenario-card {
  border: 1px solid var(--about-line);
  background: color-mix(in srgb, var(--surface), transparent 10%);
}

.audience-card {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  min-height: 172px;
  padding: 20px;
  border-radius: 18px;
}

.audience-card__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  color: var(--primary-deep);
  background: var(--primary-mist);
}

.audience-card__icon svg {
  width: 18px;
  height: 18px;
}

.audience-card__label {
  margin: 0 0 8px;
  color: var(--primary-deep);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.audience-card h3 {
  margin: 0;
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: 15px;
  letter-spacing: -0.025em;
  line-height: 1.15;
}

.audience-card div > p:last-child {
  margin: 10px 0 0;
  color: var(--about-muted);
  font-size: 10px;
  line-height: 1.65;
}

.audience-aside {
  display: grid;
  align-content: center;
  gap: 12px;
  padding: 24px;
  border-color: color-mix(in srgb, var(--about-accent), transparent 72%);
  border-radius: 18px;
  background:
    linear-gradient(145deg, color-mix(in srgb, var(--primary-mist), transparent 20%), transparent),
    color-mix(in srgb, var(--surface), transparent 10%);
}

.audience-aside .flow-signal {
  color: var(--about-accent);
}

.audience-aside strong {
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: 20px;
  letter-spacing: -0.04em;
  line-height: 1.12;
}

.audience-aside p {
  margin: 0;
  color: var(--about-muted);
  font-size: 10px;
  line-height: 1.7;
}

.scenario-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 2px 12px;
  border-bottom: 1px solid var(--about-line);
}

.scenario-heading h3 {
  margin: 8px 0 0;
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: 19px;
  letter-spacing: -0.03em;
}

.scenario-heading > span {
  color: var(--primary-deep);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.16em;
  white-space: nowrap;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
}

.scenario-card {
  min-height: 116px;
  padding: 15px;
  border-radius: 15px;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.scenario-card:hover {
  border-color: color-mix(in srgb, var(--about-accent), transparent 62%);
  box-shadow: 0 18px 36px color-mix(in srgb, var(--about-accent), transparent 92%);
  transform: translateY(-3px);
}

.scenario-card__index {
  color: var(--primary-deep);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.13em;
}

.scenario-card h4 {
  margin: 17px 0 0;
  color: var(--about-ink);
  font-size: 12px;
  line-height: 1.25;
}

.scenario-card p {
  margin: 7px 0 0;
  color: var(--about-muted);
  font-size: 9px;
  line-height: 1.55;
}

.comparison-table-wrap {
  overflow-x: auto;
  border: 1px solid var(--about-line);
  border-radius: 18px;
  background: color-mix(in srgb, var(--surface), transparent 8%);
}

.comparison-table {
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;
  color: var(--about-muted);
  font-size: 10px;
  line-height: 1.55;
}

.comparison-table th,
.comparison-table td {
  padding: 15px 16px;
  border-bottom: 1px solid var(--about-line);
  text-align: left;
  vertical-align: top;
}

.comparison-table thead th {
  color: var(--about-ink);
  font-size: 9px;
  font-weight: 850;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.comparison-table tbody tr:last-child th,
.comparison-table tbody tr:last-child td {
  border-bottom: 0;
}

.comparison-table tbody th {
  width: 18%;
  color: var(--about-ink);
  font-size: 10px;
  font-weight: 800;
}

.comparison-table__featured {
  background: color-mix(in srgb, var(--primary-mist), transparent 30%);
}

.comparison-table thead .comparison-table__featured {
  color: var(--primary-deep);
}

.comparison-quote {
  margin: 18px 0 0;
  padding: 0 0 0 18px;
  border-left: 2px solid var(--about-accent);
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: 16px;
  letter-spacing: -0.025em;
  line-height: 1.35;
}

.blueprint-section {
  padding: 25px 0 0;
}

.blueprint-flow {
  display: grid;
  grid-template-columns: 0.62fr 1.7fr 0.62fr;
  gap: 22px;
  align-items: center;
  padding: 25px 2px;
  border-bottom: 1px solid var(--about-line);
}

.blueprint-flow__aside {
  display: grid;
  gap: 10px;
  align-content: center;
  min-height: 190px;
  padding: 0 20px;
  border-left: 2px solid var(--about-accent);
}

.blueprint-flow__aside--end {
  border-right: 2px solid var(--about-purple);
  border-left: 0;
  text-align: right;
}

.flow-signal {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--primary-deep);
}

.flow-signal i {
  width: 5px;
  height: 5px;
}

.blueprint-flow__aside strong {
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: 17px;
  letter-spacing: -0.03em;
}

.blueprint-flow__aside small {
  color: var(--about-muted);
  font-size: 10px;
  line-height: 1.6;
}

.blueprint-flow__layers {
  display: grid;
  gap: 8px;
}

.blueprint-layer {
  display: grid;
  grid-template-columns: 32px 112px minmax(60px, 1fr) minmax(135px, 0.82fr);
  align-items: center;
  gap: 12px;
  min-height: 38px;
  padding: 0 14px;
  border: 1px solid var(--about-line);
  border-radius: 11px;
  background: color-mix(in srgb, var(--surface), transparent 12%);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    background 0.2s ease;
}

.blueprint-layer:hover {
  border-color: color-mix(in srgb, var(--primary), transparent 68%);
  background: color-mix(in srgb, var(--primary-mist), var(--surface) 62%);
  transform: translateX(5px);
}

.blueprint-layer__index {
  color: var(--primary-deep);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.12em;
}

.blueprint-layer__name {
  color: var(--about-ink);
  font-size: 11px;
  font-weight: 800;
}

.blueprint-layer__bar {
  height: 3px;
  overflow: hidden;
  border-radius: 99px;
  background: color-mix(in srgb, var(--primary), transparent 90%);
}

.blueprint-layer__bar i {
  display: block;
  width: 62%;
  height: 100%;
  background: linear-gradient(90deg, var(--about-accent), var(--about-purple));
  animation: about-bar-glow 4s ease-in-out infinite;
}

.blueprint-layer:nth-child(2) .blueprint-layer__bar i {
  width: 76%;
  animation-delay: -1s;
}

.blueprint-layer:nth-child(3) .blueprint-layer__bar i {
  width: 48%;
  animation-delay: -2s;
}

.blueprint-layer:nth-child(4) .blueprint-layer__bar i {
  width: 88%;
  animation-delay: -3s;
}

.blueprint-layer:nth-child(5) .blueprint-layer__bar i {
  width: 68%;
  animation-delay: -4s;
}

.blueprint-layer__tech {
  overflow: hidden;
  color: var(--about-muted);
  font-size: 9px;
  letter-spacing: 0.03em;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.stack-section {
  padding: 25px 0 0;
}

.stack-card {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: start;
  gap: 14px;
  min-height: 116px;
  padding: 18px;
  border-radius: 18px;
}

.stack-card__icon {
  display: grid;
  width: 38px;
  height: 38px;
  place-items: center;
  border-radius: 12px;
  color: var(--primary-deep);
  background: var(--primary-mist);
}

.stack-card__icon svg {
  width: 18px;
  height: 18px;
}

.stack-card h3 {
  margin: 1px 0 6px;
  color: var(--about-ink);
  font-family: var(--font-display);
  font-size: 14px;
}

.stack-card p {
  margin: 0;
  color: var(--about-muted);
  font-size: 10px;
  line-height: 1.55;
}

.stack-card__arrow {
  color: var(--primary-deep);
  font-size: 17px;
  transition: transform 0.2s ease;
}

.stack-card:hover .stack-card__arrow {
  transform: translate(2px, -2px);
}

.about-cta {
  position: relative;
  isolation: isolate;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 30px;
  overflow: hidden;
  min-height: 220px;
  padding: 32px 38px;
  border-radius: 25px;
  color: var(--about-hero-foreground);
  background: linear-gradient(132deg, var(--about-hero-start), var(--about-hero-end) 82%);
  box-shadow: 0 24px 62px color-mix(in srgb, var(--about-hero-end), transparent 84%);
}

.about-cta__mesh {
  position: absolute;
  z-index: -1;
  inset: 0;
  opacity: 0.62;
  background-image:
    linear-gradient(color-mix(in srgb, var(--about-accent), transparent 90%) 1px, transparent 1px),
    linear-gradient(
      90deg,
      color-mix(in srgb, var(--about-accent), transparent 90%) 1px,
      transparent 1px
    );
  background-size: 36px 36px;
  mask-image: linear-gradient(105deg, transparent 0, #000 55%, transparent 100%);
}

.about-cta__copy {
  max-width: 660px;
}

.about-cta .about-section__eyebrow {
  color: var(--about-accent);
}

.about-cta h2 {
  margin-top: 10px;
  color: var(--about-hero-foreground);
}

.about-cta__copy > p:last-child {
  margin: 15px 0 0;
  color: var(--about-hero-meta);
  font-size: 12px;
}

.about-cta__button {
  flex: 0 0 auto;
}

.about-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 2px 0;
  color: var(--about-muted);
  font-size: 10px;
}

.about-footer :deep(.cyber-logo) {
  --cyber-logo-mark-size: 29px;
}

.about-footer :deep(.cyber-logo__wordmark) {
  display: none;
}

.about-footer > span {
  flex: 1;
}

.about-footer a {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--primary-deep);
  font-size: 10px;
  font-weight: 800;
  text-decoration: none;
}

.about-footer a:hover {
  color: var(--about-ink);
}

@keyframes about-rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes about-grid-flow {
  to {
    background-position: 44px 44px;
  }
}

@keyframes about-orb-breathe {
  0%,
  100% {
    opacity: 0.58;
    transform: scale(0.94);
  }

  50% {
    opacity: 1;
    transform: scale(1.06);
  }
}

@keyframes about-node-pulse {
  0%,
  100% {
    opacity: 0.5;
    transform: scale(0.8) rotate(0);
  }

  50% {
    opacity: 1;
    transform: scale(1.25) rotate(45deg);
  }
}

@keyframes about-rail-scan {
  0%,
  100% {
    opacity: 0.25;
    transform: scaleX(0.88);
    transform-origin: right;
  }

  50% {
    opacity: 0.9;
    transform: scaleX(1);
  }
}

@keyframes about-halo-breathe {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.9);
  }

  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}

@keyframes about-orbit-one {
  to {
    transform: rotateX(66deg) rotateZ(338deg);
  }
}

@keyframes about-orbit-two {
  to {
    transform: rotateY(67deg) rotateZ(-338deg);
  }
}

@keyframes about-core-pulse {
  0%,
  100% {
    filter: brightness(0.94);
    transform: translateZ(40px) scale(0.94);
  }

  50% {
    filter: brightness(1.2);
    transform: translateZ(54px) scale(1.05);
  }
}

@keyframes about-bar-glow {
  0%,
  100% {
    opacity: 0.6;
    transform: translateX(-8%);
  }

  50% {
    opacity: 1;
    transform: translateX(8%);
  }
}

@media (max-width: 1120px) {
  .about-hero__body {
    grid-template-columns: minmax(0, 1fr) minmax(330px, 0.9fr);
  }

  .blueprint-visual {
    transform: scale(0.86);
    transform-origin: right center;
  }

  .about-principles {
    grid-template-columns: 1fr;
  }

  .about-section__intro {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
  }

  .about-section__intro > p:last-child {
    max-width: 290px;
    margin: 0;
    text-align: right;
  }

  .scenario-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 820px) {
  .about-hero {
    min-height: 0;
    padding: 24px 24px 20px;
    border-radius: 25px;
  }

  .about-hero__body {
    display: block;
    padding: 72px 0 20px;
  }

  .blueprint-visual {
    width: 100%;
    height: 310px;
    margin-top: 5px;
    transform: scale(0.73);
    transform-origin: top center;
  }

  .about-hero__footer {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .about-hero__footer span:last-child {
    width: 100%;
  }

  .principle-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .blueprint-flow {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .audience-layout {
    grid-template-columns: 1fr;
  }

  .blueprint-flow__aside,
  .blueprint-flow__aside--end {
    min-height: 0;
    padding: 15px 18px;
    border-top: 1px solid var(--about-line);
    border-right: 0;
    border-bottom: 0;
    border-left: 2px solid var(--about-accent);
    text-align: left;
  }

  .blueprint-flow__aside--end {
    border-left-color: var(--about-purple);
  }

  .stack-grid {
    grid-template-columns: 1fr;
  }

  .about-cta {
    align-items: flex-start;
    flex-direction: column;
  }
}

@media (max-width: 580px) {
  .about-page {
    gap: 22px;
  }

  .about-hero__topline {
    align-items: flex-start;
    flex-direction: column;
    gap: 14px;
  }

  .about-hero__body {
    padding-top: 50px;
  }

  .about-hero__copy h1 {
    font-size: clamp(42px, 13vw, 58px);
  }

  .about-hero__description {
    font-size: 12px;
  }

  .about-hero__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .about-button {
    width: 100%;
  }

  .blueprint-visual {
    height: 260px;
    transform: scale(0.58);
    transform-origin: top center;
  }

  .about-hero__footer {
    display: grid;
    gap: 10px;
  }

  .about-section__intro,
  .section-heading {
    display: grid;
    gap: 10px;
  }

  .about-section__intro > p:last-child,
  .section-heading > p {
    max-width: 100%;
    text-align: left;
  }

  .principle-grid {
    grid-template-columns: 1fr;
  }

  .audience-card-grid,
  .scenario-grid {
    grid-template-columns: 1fr;
  }

  .scenario-heading {
    align-items: flex-start;
    flex-direction: column;
    gap: 9px;
  }

  .principle-card {
    min-height: 190px;
  }

  .blueprint-layer {
    grid-template-columns: 28px 1fr auto;
    gap: 8px;
    padding: 0 10px;
  }

  .blueprint-layer__bar {
    display: none;
  }

  .blueprint-layer__tech {
    max-width: 112px;
    text-align: right;
  }

  .about-cta {
    padding: 28px 24px;
    border-radius: 22px;
  }

  .about-footer {
    flex-wrap: wrap;
  }

  .about-footer > span {
    order: 3;
    width: 100%;
    flex-basis: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .about-hero__grid,
  .about-hero__orb,
  .about-hero__rail,
  .about-hero__copy,
  .blueprint-visual,
  .blueprint-visual__halo,
  .blueprint-visual__orbit,
  .blueprint-visual__core,
  .blueprint-layer__bar i {
    animation: none;
  }

  .about-hero__copy,
  .blueprint-visual {
    opacity: 1;
    transform: none;
  }
}
</style>
