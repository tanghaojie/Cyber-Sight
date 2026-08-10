<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import ProductScene from './components/ProductScene.vue'
import { content, GITHUB_URL, type Locale } from './content'

const LOCALE_STORAGE_KEY = 'cyber_ai_forge_site_locale:v1'
const commands = `pnpm install
Copy-Item apps/backend/.env.example apps/backend/.env
pnpm db:migrate
pnpm dev`

const locale = ref<Locale>('en')
const mobileMenuOpen = ref(false)
const headerScrolled = ref(false)
const showcaseSection = ref<HTMLElement | null>(null)
const ringProgress = ref(0)
const activeScene = ref(0)
const ringEnabled = ref(false)
const copied = ref(false)
const t = computed(function () {
  return content[locale.value]
})

let frameId = 0
let copyTimer = 0
let revealObserver: IntersectionObserver | undefined
let reducedMotionQuery: MediaQueryList | undefined
let compactQuery: MediaQueryList | undefined

function getInitialLocale(): Locale {
  const queryLocale = new URLSearchParams(window.location.search).get('lang')
  if (queryLocale === 'zh' || queryLocale === 'en') {
    return queryLocale
  }

  try {
    const storedLocale = window.localStorage.getItem(LOCALE_STORAGE_KEY)
    if (storedLocale === 'zh' || storedLocale === 'en') {
      return storedLocale
    }
  } catch {
    // A blocked storage API should not prevent the public site from loading.
  }

  return navigator.language.toLowerCase().startsWith('zh') ? 'zh' : 'en'
}

function updateDocumentMetadata(): void {
  document.documentElement.lang = locale.value === 'zh' ? 'zh-CN' : 'en'
  document.title = t.value.meta.title
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', t.value.meta.description)
  document.querySelector('meta[property="og:title"]')?.setAttribute('content', t.value.meta.title)
  document
    .querySelector('meta[property="og:description"]')
    ?.setAttribute('content', t.value.meta.description)
}

function setLocale(nextLocale: Locale, updateUrl = true): void {
  locale.value = nextLocale
  mobileMenuOpen.value = false

  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, nextLocale)
  } catch {
    // URL state still preserves the selected locale when storage is unavailable.
  }

  if (updateUrl) {
    const url = new URL(window.location.href)
    url.searchParams.set('lang', nextLocale)
    window.history.replaceState({}, '', url)
  }

  nextTick(updateDocumentMetadata)
}

function updateRingMode(): void {
  ringEnabled.value = !(reducedMotionQuery?.matches ?? false) && !(compactQuery?.matches ?? false)
  requestScrollUpdate()
}

function updateScrollState(): void {
  frameId = 0
  headerScrolled.value = window.scrollY > 20

  const section = showcaseSection.value
  if (!section || !ringEnabled.value) {
    return
  }

  const rect = section.getBoundingClientRect()
  const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1)
  const progress = Math.min(Math.max(-rect.top / scrollRange, 0), 1)
  ringProgress.value = progress
  activeScene.value = Math.min(
    t.value.showcase.scenes.length - 1,
    Math.round(progress * (t.value.showcase.scenes.length - 1)),
  )
}

function requestScrollUpdate(): void {
  if (frameId) {
    return
  }
  frameId = window.requestAnimationFrame(updateScrollState)
}

function sceneCardStyle(index: number): Record<string, string> {
  return {
    '--scene-angle': `${index * 60}deg`,
  }
}

function selectScene(index: number): void {
  activeScene.value = index

  if (!ringEnabled.value || !showcaseSection.value) {
    document.getElementById(`scene-${index}`)?.scrollIntoView({
      behavior: reducedMotionQuery?.matches ? 'auto' : 'smooth',
      inline: 'center',
      block: 'nearest',
    })
    return
  }

  const section = showcaseSection.value
  const top = window.scrollY + section.getBoundingClientRect().top
  const scrollRange = Math.max(section.offsetHeight - window.innerHeight, 1)
  window.scrollTo({
    top: top + (index / (t.value.showcase.scenes.length - 1)) * scrollRange,
    behavior: reducedMotionQuery?.matches ? 'auto' : 'smooth',
  })
}

function handleShowcaseKeydown(event: KeyboardEvent): void {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
    return
  }
  event.preventDefault()
  const direction = event.key === 'ArrowRight' ? 1 : -1
  const sceneCount = t.value.showcase.scenes.length
  selectScene((activeScene.value + direction + sceneCount) % sceneCount)
}

async function copyCommands(): Promise<void> {
  try {
    await navigator.clipboard.writeText(commands)
    copied.value = true
    window.clearTimeout(copyTimer)
    copyTimer = window.setTimeout(function () {
      copied.value = false
    }, 1800)
  } catch {
    copied.value = false
  }
}

function closeMobileMenu(): void {
  mobileMenuOpen.value = false
}

function observeReveals(): void {
  if (reducedMotionQuery?.matches || !('IntersectionObserver' in window)) {
    document.querySelectorAll('.reveal').forEach(function (element) {
      element.classList.add('is-visible')
    })
    return
  }

  revealObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) {
          return
        }
        entry.target.classList.add('is-visible')
        revealObserver?.unobserve(entry.target)
      })
    },
    { threshold: 0.14 },
  )

  document.querySelectorAll('.reveal').forEach(function (element) {
    revealObserver?.observe(element)
  })
}

onMounted(function () {
  reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  compactQuery = window.matchMedia('(max-width: 900px), (pointer: coarse)')
  reducedMotionQuery.addEventListener('change', updateRingMode)
  compactQuery.addEventListener('change', updateRingMode)
  window.addEventListener('scroll', requestScrollUpdate, { passive: true })
  window.addEventListener('resize', requestScrollUpdate, { passive: true })

  setLocale(getInitialLocale(), false)
  updateRingMode()
  requestScrollUpdate()
  nextTick(observeReveals)
})

onBeforeUnmount(function () {
  window.removeEventListener('scroll', requestScrollUpdate)
  window.removeEventListener('resize', requestScrollUpdate)
  reducedMotionQuery?.removeEventListener('change', updateRingMode)
  compactQuery?.removeEventListener('change', updateRingMode)
  revealObserver?.disconnect()
  window.cancelAnimationFrame(frameId)
  window.clearTimeout(copyTimer)
})
</script>

<template>
  <a class="skip-link" href="#main-content">{{ t.skip }}</a>

  <header class="site-header" :class="{ 'is-scrolled': headerScrolled, 'is-open': mobileMenuOpen }">
    <div class="header-inner">
      <a class="brand-lockup" href="#top" aria-label="Cyber AI Forge home" @click="closeMobileMenu">
        <img src="/cyber-mark.svg" alt="" width="42" height="42" />
        <span><strong>CYBER</strong><small>AI FORGE</small></span>
      </a>

      <nav class="desktop-nav" :aria-label="t.header.menuLabel">
        <a v-for="item in t.header.nav" :key="item.href" :href="item.href">{{ item.label }}</a>
      </nav>

      <div class="header-actions">
        <div
          class="language-switcher"
          :class="{ 'is-zh': locale === 'zh' }"
          :aria-label="t.header.languageLabel"
          role="group"
        >
          <button
            type="button"
            :class="{ 'is-active': locale === 'en' }"
            :aria-pressed="locale === 'en'"
            aria-label="English"
            @click="setLocale('en')"
          >
            EN
          </button>
          <button
            type="button"
            :class="{ 'is-active': locale === 'zh' }"
            :aria-pressed="locale === 'zh'"
            aria-label="中文"
            @click="setLocale('zh')"
          >
            中
          </button>
        </div>

        <a class="header-github" :href="GITHUB_URL" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.88c-2.78.6-3.37-1.18-3.37-1.18-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.35 1.09 2.92.83.09-.65.35-1.09.64-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02A9.57 9.57 0 0 1 12 6.82a9.6 9.6 0 0 1 2.5.34c1.9-1.29 2.74-1.02 2.74-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.86V21c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
            />
          </svg>
          <span>{{ t.header.github }}</span>
        </a>

        <button
          class="menu-toggle"
          type="button"
          :aria-label="t.header.menuLabel"
          :aria-expanded="mobileMenuOpen"
          @click="mobileMenuOpen = !mobileMenuOpen"
        >
          <span></span><span></span>
        </button>
      </div>
    </div>

    <nav class="mobile-nav" :aria-label="t.header.menuLabel">
      <a
        v-for="(item, index) in t.header.nav"
        :key="item.href"
        :href="item.href"
        @click="closeMobileMenu"
        ><small>0{{ index + 1 }}</small
        >{{ item.label }}</a
      >
      <a :href="GITHUB_URL" target="_blank" rel="noreferrer" @click="closeMobileMenu"
        ><small>↗</small>{{ t.header.github }}</a
      >
    </nav>
  </header>

  <main id="main-content">
    <section id="top" class="hero-section">
      <div class="hero-grid" aria-hidden="true"></div>
      <div class="hero-glow" aria-hidden="true"></div>
      <div class="container hero-layout">
        <div class="hero-copy">
          <div class="eyebrow reveal"><i></i>{{ t.hero.eyebrow }}</div>
          <h1 class="hero-title reveal">
            <span>{{ t.hero.titleTop }}</span
            ><span class="outline-text">{{ t.hero.titleBottom }}</span>
          </h1>
          <p class="hero-lead reveal">{{ t.hero.lead }}</p>
          <div class="hero-actions reveal">
            <a class="button button-primary" :href="GITHUB_URL" target="_blank" rel="noreferrer"
              ><span>{{ t.hero.source }}</span
              ><i aria-hidden="true">↗</i></a
            >
            <a class="button button-ghost" href="#showcase"
              ><span>{{ t.hero.explore }}</span
              ><i aria-hidden="true">↓</i></a
            >
          </div>
        </div>

        <div class="hero-machine reveal" aria-hidden="true">
          <div class="machine-label machine-label-top">SYSTEM / 001</div>
          <div class="orbit orbit-outer"><i></i><i></i><i></i></div>
          <div class="orbit orbit-middle"><i></i><i></i></div>
          <div class="orbit orbit-inner"></div>
          <div class="machine-crosshair"><span></span><span></span></div>
          <img class="machine-logo" src="/cyber-mark.svg" alt="" width="112" height="112" />
          <div class="machine-node node-a"></div>
          <div class="machine-node node-b"></div>
          <div class="machine-node node-c"></div>
          <div class="machine-label machine-label-bottom">CONTRACT / VERIFIED</div>
        </div>

        <div class="hero-status reveal">
          <span><i></i>{{ t.hero.signal }}</span
          ><b>CYBER / 0.1.0</b>
        </div>
      </div>

      <div class="hero-stats container reveal">
        <div v-for="stat in t.hero.stats" :key="stat.label">
          <strong>{{ stat.value }}</strong
          ><span>{{ stat.label }}</span>
        </div>
      </div>
    </section>

    <section class="manifesto-section light-section">
      <div class="container">
        <div class="section-heading dark-heading reveal">
          <span class="section-label">{{ t.manifesto.label }}</span>
          <h2>{{ t.manifesto.title }}</h2>
          <p>{{ t.manifesto.lead }}</p>
        </div>
        <div class="comparison-grid reveal">
          <article class="comparison-card is-muted">
            <span class="comparison-index">A /</span>
            <h3>{{ t.manifesto.directTitle }}</h3>
            <p>{{ t.manifesto.directText }}</p>
            <div class="broken-line" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
          </article>
          <article class="comparison-card is-cyber">
            <span class="comparison-index">B /</span>
            <h3>{{ t.manifesto.cyberTitle }}</h3>
            <p>{{ t.manifesto.cyberText }}</p>
            <div class="node-line" aria-hidden="true">
              <i></i><i></i><i></i><i></i><span></span>
            </div>
          </article>
        </div>
        <blockquote class="manifesto-quote reveal">
          <span>“</span>{{ t.manifesto.quote }}
        </blockquote>
      </div>
    </section>

    <section
      id="showcase"
      ref="showcaseSection"
      class="showcase-section"
      :class="{ 'ring-mode': ringEnabled }"
    >
      <div class="showcase-sticky">
        <div class="container showcase-copy">
          <div class="section-heading reveal">
            <span class="section-label">{{ t.showcase.label }}</span>
            <h2>{{ t.showcase.title }}</h2>
            <p>{{ t.showcase.lead }}</p>
          </div>
          <div v-if="ringEnabled" class="scroll-cue" aria-hidden="true">
            <i></i><span>{{ t.showcase.scrollHint }}</span>
          </div>
        </div>

        <div
          v-if="ringEnabled"
          class="ring-viewport"
          tabindex="0"
          :aria-label="t.showcase.sceneLabel"
          @keydown="handleShowcaseKeydown"
        >
          <div
            class="showcase-ring"
            :style="{ transform: `rotateX(-5deg) rotateY(${-ringProgress * 300}deg)` }"
          >
            <article
              v-for="(scene, index) in t.showcase.scenes"
              :id="`scene-${index}`"
              :key="scene.code"
              class="ring-card"
              :class="{ 'is-active': activeScene === index }"
              :style="sceneCardStyle(index)"
              :aria-hidden="activeScene !== index"
            >
              <ProductScene :scene="scene" />
            </article>
          </div>
        </div>

        <div v-else class="scene-strip container" tabindex="0" @keydown="handleShowcaseKeydown">
          <article
            v-for="(scene, index) in t.showcase.scenes"
            :id="`scene-${index}`"
            :key="scene.code"
            class="strip-card"
          >
            <ProductScene :scene="scene" />
            <div class="strip-card-copy">
              <span>{{ scene.code }}</span>
              <h3>{{ scene.title }}</h3>
              <p>{{ scene.description }}</p>
            </div>
          </article>
        </div>

        <div class="showcase-caption container" aria-live="polite">
          <div>
            <span>{{ t.showcase.scenes[activeScene].code }}</span>
            <h3>{{ t.showcase.scenes[activeScene].title }}</h3>
            <p>{{ t.showcase.scenes[activeScene].description }}</p>
          </div>
          <div class="scene-pagination" :aria-label="t.showcase.sceneLabel">
            <button
              v-for="(scene, index) in t.showcase.scenes"
              :key="scene.code"
              type="button"
              :class="{ 'is-active': activeScene === index }"
              :aria-label="`${t.showcase.sceneLabel} ${index + 1}: ${scene.title}`"
              :aria-current="activeScene === index ? 'true' : undefined"
              @click="selectScene(index)"
            >
              <span>{{ String(index + 1).padStart(2, '0') }}</span>
            </button>
          </div>
        </div>
      </div>
    </section>

    <section id="features" class="features-section light-section">
      <div class="container">
        <div class="section-heading dark-heading reveal">
          <span class="section-label">{{ t.features.label }}</span>
          <h2>{{ t.features.title }}</h2>
          <p>{{ t.features.lead }}</p>
        </div>
        <div class="feature-grid">
          <article
            v-for="(feature, index) in t.features.items"
            :key="feature.code"
            class="feature-card reveal"
          >
            <div class="feature-number">{{ String(index + 1).padStart(2, '0') }}</div>
            <span class="feature-code">{{ feature.code }}</span>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
            <small>{{ feature.detail }}</small>
            <div class="feature-corner" aria-hidden="true"></div>
          </article>
        </div>
      </div>
    </section>

    <section class="workflow-section">
      <div class="container">
        <div class="section-heading reveal">
          <span class="section-label">{{ t.workflow.label }}</span>
          <h2>{{ t.workflow.title }}</h2>
        </div>
        <div class="workflow-track">
          <article v-for="step in t.workflow.steps" :key="step.number" class="workflow-step reveal">
            <div class="workflow-number">{{ step.number }}</div>
            <div class="workflow-node"><i></i></div>
            <div class="workflow-copy">
              <span>{{ step.output }}</span>
              <h3>{{ step.title }}</h3>
              <p>{{ step.description }}</p>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="system" class="architecture-section">
      <div class="architecture-grid-bg" aria-hidden="true"></div>
      <div class="container architecture-layout">
        <div class="section-heading reveal">
          <span class="section-label">{{ t.architecture.label }}</span>
          <h2>{{ t.architecture.title }}</h2>
          <p>{{ t.architecture.lead }}</p>
        </div>
        <div class="stack-flow reveal">
          <div v-for="(item, index) in t.architecture.stack" :key="item.name" class="stack-node">
            <span>0{{ index + 1 }}</span
            ><strong>{{ item.name }}</strong
            ><small>{{ item.detail }}</small
            ><i v-if="index < t.architecture.stack.length - 1"></i>
          </div>
        </div>
        <div class="contract-panel reveal">
          <div class="contract-visual" aria-hidden="true">
            <span class="contract-core">Z</span><i class="beam beam-a"></i
            ><i class="beam beam-b"></i><i class="beam beam-c"></i
            ><b class="contract-endpoint endpoint-a">TS</b
            ><b class="contract-endpoint endpoint-b">HTTP</b
            ><b class="contract-endpoint endpoint-c">OAS</b>
          </div>
          <div>
            <span class="section-label">RUNTIME CONTRACT</span>
            <h3>{{ t.architecture.contractTitle }}</h3>
            <p>{{ t.architecture.contractText }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="audience-section light-section">
      <div class="container">
        <div class="section-heading dark-heading reveal">
          <span class="section-label">{{ t.audience.label }}</span>
          <h2>{{ t.audience.title }}</h2>
        </div>
        <div class="audience-grid">
          <article class="audience-card reveal">
            <span>01 / IDEA → PRODUCT</span>
            <h3>{{ t.audience.makersTitle }}</h3>
            <p>{{ t.audience.makersText }}</p>
            <div class="audience-glyph maker-glyph" aria-hidden="true"><i></i><i></i><i></i></div>
          </article>
          <article class="audience-card is-dark reveal">
            <span>02 / SYSTEM → SCALE</span>
            <h3>{{ t.audience.developersTitle }}</h3>
            <p>{{ t.audience.developersText }}</p>
            <div class="audience-glyph developer-glyph" aria-hidden="true">
              <i></i><i></i><i></i>
            </div>
          </article>
        </div>
      </div>
    </section>

    <section id="start" class="start-section light-section">
      <div class="container start-layout">
        <div class="section-heading dark-heading reveal">
          <span class="section-label">{{ t.start.label }}</span>
          <h2>{{ t.start.title }}</h2>
          <p>{{ t.start.lead }}</p>
        </div>
        <div class="terminal reveal">
          <div class="terminal-top">
            <span>POWERED BY PNPM / LOCAL SETUP</span
            ><button type="button" @click="copyCommands">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="8" y="8" width="11" height="11" rx="1" />
                <path d="M16 8V5H5v11h3" /></svg
              >{{ copied ? t.start.copied : t.start.copy }}
            </button>
          </div>
          <pre><code><span>$</span> pnpm install

<span>$</span> Copy-Item apps/backend/.env.example apps/backend/.env

<span>$</span> pnpm db:migrate
<span>$</span> pnpm dev</code></pre>
          <div class="terminal-status"><i></i>http://localhost:5173 <span>READY</span></div>
        </div>
        <aside class="boundaries reveal">
          <span class="section-label">REALITY CHECK</span>
          <h3>{{ t.start.boundariesTitle }}</h3>
          <ul>
            <li v-for="boundary in t.start.boundaries" :key="boundary">
              <i></i><span>{{ boundary }}</span>
            </li>
          </ul>
        </aside>
      </div>
    </section>

    <section class="closing-section">
      <div class="closing-orbit" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="container closing-content reveal">
        <span class="section-label">{{ t.closing.label }}</span>
        <h2>{{ t.closing.title }}</h2>
        <p>{{ t.closing.lead }}</p>
        <a
          class="button button-primary closing-button"
          :href="GITHUB_URL"
          target="_blank"
          rel="noreferrer"
          ><span>{{ t.closing.github }}</span
          ><i aria-hidden="true">↗</i></a
        >
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <div class="brand-lockup">
        <img src="/cyber-mark.svg" alt="" width="42" height="42" /><span
          ><strong>CYBER</strong><small>AI FORGE</small></span
        >
      </div>
      <p>{{ t.closing.creator }}</p>
      <a href="#top">{{ t.closing.backTop }} ↑</a>
    </div>
  </footer>
</template>
