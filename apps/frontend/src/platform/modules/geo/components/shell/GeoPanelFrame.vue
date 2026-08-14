<template>
  <aside class="geo-panel" :aria-label="title">
    <header class="geo-panel__header">
      <div>
        <span>{{ eyebrow }}</span>
        <h2>{{ title }}</h2>
      </div>
      <button type="button" :aria-label="closeLabel" :title="closeLabel" @click="$emit('close')">
        <AppIcon name="close" />
      </button>
    </header>
    <div class="geo-panel__body"><slot /></div>
  </aside>
</template>

<script setup lang="ts">
import AppIcon from '@/foundation/components/AppIcon.vue'

defineProps<{
  title: string
  eyebrow: string
  closeLabel: string
}>()

defineEmits<{ close: [] }>()
</script>

<style scoped>
.geo-panel {
  position: absolute;
  z-index: 19;
  top: 96px;
  bottom: 86px;
  left: 90px;
  width: min(322px, calc(100vw - 196px));
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  overflow: hidden;
  border: 1px solid var(--geo-line);
  border-radius: 18px;
  color: var(--geo-text);
  background: var(--geo-surface);
  box-shadow: var(--geo-shadow);
  backdrop-filter: blur(22px) saturate(120%);
  animation: geo-panel-enter 0.24s cubic-bezier(0.22, 1, 0.36, 1);
}

.geo-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 18px 15px;
  border-bottom: 1px solid var(--geo-line);
}

.geo-panel__header span {
  color: var(--geo-accent);
  font-size: 8px;
  font-weight: 850;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.geo-panel__header h2 {
  margin: 4px 0 0;
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 740;
  letter-spacing: -0.03em;
}

.geo-panel__header button {
  width: 38px;
  height: 38px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  border: 0;
  border-radius: 11px;
  color: var(--geo-text-faint);
  background: transparent;
}

.geo-panel__header button:hover,
.geo-panel__header button:focus-visible {
  outline: 0;
  color: var(--geo-text);
  background: var(--geo-surface-hover);
}

.geo-panel__body {
  min-height: 0;
  overflow: auto;
  padding: 18px;
}

@keyframes geo-panel-enter {
  from {
    opacity: 0;
    transform: translateX(-10px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateX(0) scale(1);
  }
}

@media (max-width: 760px) {
  .geo-panel {
    top: auto;
    right: 12px;
    bottom: 136px;
    left: 12px;
    width: auto;
    max-height: min(520px, calc(100vh - 220px));
  }
}

@media (prefers-reduced-motion: reduce) {
  .geo-panel {
    animation: none;
  }
}
</style>
