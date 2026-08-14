<template>
  <footer class="geo-statusbar" aria-live="polite">
    <span class="geo-statusbar__position"><AppIcon name="map-pin" /></span>
    <span
      ><small>{{ longitudeLabel }}</small
      >{{ coordinate(longitude) }}</span
    >
    <span
      ><small>{{ latitudeLabel }}</small
      >{{ coordinate(latitude) }}</span
    >
    <span class="geo-statusbar__optional"
      ><small>{{ heightLabel }}</small
      >{{ height(surfaceHeight) }}</span
    >
    <span class="geo-statusbar__optional"
      ><small>{{ cameraLabel }}</small
      >{{ height(cameraHeight) }}</span
    >
    <span class="geo-statusbar__optional"
      ><small>{{ fpsLabel }}</small
      >{{ fps ?? '—' }}</span
    >
    <strong><i :class="{ 'geo-statusbar__pulse': active }" />{{ hint }}</strong>
  </footer>
</template>

<script setup lang="ts">
import AppIcon from '@/foundation/components/AppIcon.vue'

defineProps<{
  longitude?: number
  latitude?: number
  surfaceHeight?: number
  cameraHeight?: number
  fps?: number
  hint: string
  active: boolean
  longitudeLabel: string
  latitudeLabel: string
  heightLabel: string
  cameraLabel: string
  fpsLabel: string
}>()

function coordinate(value: number | undefined): string {
  return value === undefined ? '—' : `${value.toFixed(4)}°`
}

function height(value: number | undefined): string {
  if (value === undefined) {
    return '—'
  }
  if (Math.abs(value) >= 1000) {
    return `${(value / 1000).toFixed(1)} km`
  }
  return `${value.toFixed(1)} m`
}
</script>

<style scoped>
.geo-statusbar {
  position: absolute;
  z-index: 20;
  right: 22px;
  bottom: 14px;
  left: 22px;
  min-height: 48px;
  display: flex;
  align-items: center;
  gap: 0;
  padding: 6px 10px;
  border: 1px solid var(--geo-line);
  border-radius: 15px;
  color: var(--geo-text-soft);
  background: var(--geo-surface-strong);
  box-shadow: var(--geo-shadow);
  backdrop-filter: blur(18px) saturate(125%);
}

.geo-statusbar > span:not(.geo-statusbar__position) {
  min-width: 122px;
  display: inline-flex;
  align-items: baseline;
  gap: 7px;
  padding: 3px 16px;
  border-right: 1px solid var(--geo-line);
  font-family: var(--font-display);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

.geo-statusbar small {
  color: var(--geo-text-faint);
  font-family: inherit;
  font-size: 8px;
  font-weight: 700;
}

.geo-statusbar__position {
  width: 34px;
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  color: var(--geo-accent);
}

.geo-statusbar strong {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
  padding: 0 10px 0 20px;
  overflow: hidden;
  color: var(--geo-text);
  font-size: 10px;
  font-weight: 650;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.geo-statusbar strong i {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--geo-accent);
}

.geo-statusbar__pulse {
  animation: geo-tool-pulse 1.4s ease-in-out infinite;
}

@keyframes geo-tool-pulse {
  50% {
    box-shadow: 0 0 0 5px color-mix(in srgb, var(--geo-accent), transparent 84%);
  }
}

@media (max-width: 1120px) {
  .geo-statusbar > span:not(.geo-statusbar__position) {
    min-width: 100px;
    padding-inline: 11px;
  }

  .geo-statusbar__optional:nth-of-type(4),
  .geo-statusbar__optional:nth-of-type(6) {
    display: none;
  }
}

@media (max-width: 760px) {
  .geo-statusbar {
    right: 12px;
    bottom: 10px;
    left: 12px;
    min-height: 48px;
  }

  .geo-statusbar > span:not(.geo-statusbar__position) {
    display: none;
  }

  .geo-statusbar strong {
    padding-left: 8px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .geo-statusbar__pulse {
    animation: none;
  }
}
</style>
