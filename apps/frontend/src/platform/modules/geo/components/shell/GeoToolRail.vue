<template>
  <nav class="geo-tool-rail" :aria-label="label">
    <button
      v-for="item in items"
      :key="item.id"
      class="geo-tool-rail__item"
      :class="{ 'geo-tool-rail__item--active': activeId === item.id }"
      type="button"
      :aria-current="activeId === item.id ? 'page' : undefined"
      :title="item.label"
      @click="$emit('select', item.id)"
    >
      <span class="geo-tool-rail__indicator" aria-hidden="true" />
      <AppIcon :name="item.icon" />
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import AppIcon from '@/foundation/components/AppIcon.vue'

export interface GeoTaskRailItem {
  id: string
  label: string
  icon: string
}

defineProps<{
  items: readonly GeoTaskRailItem[]
  activeId?: string
  label: string
}>()

defineEmits<{
  select: [id: string]
}>()
</script>

<style scoped>
.geo-tool-rail {
  position: absolute;
  z-index: 20;
  top: 96px;
  bottom: 86px;
  left: 22px;
  width: 58px;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  padding: 7px 5px;
  border: 1px solid var(--geo-line);
  border-radius: 17px;
  background: var(--geo-surface-strong);
  box-shadow: var(--geo-shadow);
  backdrop-filter: blur(18px) saturate(125%);
  overflow-x: hidden;
  overflow-y: auto;
}

.geo-tool-rail__item {
  position: relative;
  min-height: 58px;
  display: grid;
  place-items: center;
  gap: 4px;
  padding: 7px 2px 6px;
  border: 1px solid transparent;
  border-radius: 12px;
  color: var(--geo-text-faint);
  background: transparent;
  transition:
    color 0.18s ease,
    border-color 0.18s ease,
    background-color 0.18s ease,
    transform 0.18s ease;
}

.geo-tool-rail__item:hover,
.geo-tool-rail__item:focus-visible {
  outline: 0;
  color: var(--geo-text);
  background: var(--geo-surface-hover);
  transform: translateX(1px);
}

.geo-tool-rail__item--active {
  border-color: color-mix(in srgb, var(--geo-accent), transparent 54%);
  color: var(--geo-accent);
  background: color-mix(in srgb, var(--geo-accent), transparent 88%);
}

.geo-tool-rail__indicator {
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: -6px;
  width: 2px;
  border-radius: 3px;
  background: transparent;
}

.geo-tool-rail__item--active .geo-tool-rail__indicator {
  background: var(--geo-accent);
  box-shadow: 0 0 10px color-mix(in srgb, var(--geo-accent), transparent 25%);
}

.geo-tool-rail__item :deep(svg) {
  width: 20px;
  height: 20px;
}

.geo-tool-rail__item > span:last-child {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
}

@media (max-height: 720px) and (min-width: 761px) {
  .geo-tool-rail__item {
    min-height: 49px;
  }
}

@media (max-width: 760px) {
  .geo-tool-rail {
    top: auto;
    right: 12px;
    bottom: 68px;
    left: 12px;
    width: auto;
    height: 58px;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    padding: 5px;
    overflow-x: auto;
    overflow-y: hidden;
  }

  .geo-tool-rail__item {
    width: 100%;
    min-height: 46px;
    padding: 4px 2px;
  }

  .geo-tool-rail__indicator {
    inset: auto 12px -6px;
    width: auto;
    height: 2px;
  }
}
</style>
