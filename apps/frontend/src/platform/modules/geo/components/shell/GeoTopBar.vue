<template>
  <header class="geo-topbar">
    <div class="geo-topbar__identity">
      <PlatformLogo icon-only tone="light" />
      <strong>{{ title }}</strong>
    </div>
    <span class="geo-topbar__divider" aria-hidden="true" />
    <button class="geo-topbar__scene" type="button" :aria-label="sceneName">
      <span>{{ sceneName }}</span>
      <AppIcon name="chevron-down" />
    </button>
    <span class="geo-topbar__session"><i />{{ sessionLabel }}</span>
  </header>
</template>

<script setup lang="ts">
import AppIcon from '@/foundation/components/AppIcon.vue'
import PlatformLogo from '@/foundation/components/platform/PlatformLogo.vue'

defineProps<{
  title: string
  sceneName: string
  sessionLabel: string
}>()
</script>

<style scoped>
.geo-topbar {
  position: absolute;
  z-index: 20;
  top: 16px;
  left: 50%;
  width: min(700px, calc(100vw - 190px));
  min-height: 54px;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 8px 16px;
  border: 1px solid var(--geo-line);
  border-radius: 18px;
  color: var(--geo-text);
  background: var(--geo-surface-strong);
  box-shadow: var(--geo-shadow);
  backdrop-filter: blur(18px) saturate(125%);
  transform: translateX(-50%);
}

.geo-topbar__identity,
.geo-topbar__scene,
.geo-topbar__session {
  display: inline-flex;
  align-items: center;
}

.geo-topbar__identity {
  gap: 9px;
  flex: 0 0 auto;
}

.geo-topbar__identity :deep(.cyber-logo) {
  --cyber-logo-mark-size: 30px;
  --brand-accent: var(--geo-accent);
  --brand-node: #8ddcff;
}

.geo-topbar__identity strong {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 760;
  letter-spacing: -0.02em;
}

.geo-topbar__divider {
  width: 1px;
  height: 24px;
  flex: 0 0 auto;
  background: var(--geo-line-strong);
}

.geo-topbar__scene {
  min-width: 0;
  gap: 8px;
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  color: var(--geo-text-soft);
  background: transparent;
  transition:
    color 0.18s ease,
    background-color 0.18s ease;
}

.geo-topbar__scene:hover,
.geo-topbar__scene:focus-visible {
  outline: 0;
  color: var(--geo-text);
  background: var(--geo-surface-hover);
}

.geo-topbar__scene span {
  overflow: hidden;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geo-topbar__scene :deep(svg) {
  width: 14px;
  height: 14px;
}

.geo-topbar__session {
  gap: 7px;
  margin-left: auto;
  color: var(--geo-text-faint);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.14em;
  white-space: nowrap;
}

.geo-topbar__session i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--geo-accent);
  box-shadow: 0 0 12px color-mix(in srgb, var(--geo-accent), transparent 35%);
}

@media (max-width: 760px) {
  .geo-topbar {
    right: 12px;
    left: 12px;
    width: auto;
    transform: none;
  }

  .geo-topbar__session {
    display: none;
  }
}
</style>
