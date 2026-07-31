<template>
  <nav class="tag-view" :aria-label="t('tag-view.history.label')">
    <div ref="historyRef" class="tag-view__history">
      <div
        v-for="tag in tags"
        :key="tag.path"
        class="tag-view__item"
        :class="{ 'tag-view__item--active': tag.path === activePath }"
      >
        <button
          class="tag-view__link"
          type="button"
          :title="tag.title"
          :aria-current="tag.path === activePath ? 'page' : undefined"
          @click="$emit('navigate', tag.path)"
        >
          <span class="tag-view__marker" aria-hidden="true" />
          <span class="tag-view__title">{{ tag.title }}</span>
        </button>
        <button
          class="tag-view__close"
          type="button"
          :aria-label="t('tag-view.close.label', { title: tag.title })"
          @click="$emit('close', tag.path)"
        >
          <Close />
        </button>
      </div>
    </div>

    <div class="tag-view__actions">
      <el-dropdown trigger="click" @command="handleCommand">
        <button
          class="tag-view__action-button"
          type="button"
          :aria-label="t('tag-view.actions.label')"
        >
          <span>{{ t('tag-view.actions.label') }}</span>
          <ArrowDown />
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="close-current" :disabled="!hasCurrent">
              {{ t('tag-view.actions.closeCurrent') }}
            </el-dropdown-item>
            <el-dropdown-item command="close-others" :disabled="!hasCurrent || tags.length <= 1">
              {{ t('tag-view.actions.closeOthers') }}
            </el-dropdown-item>
            <el-dropdown-item command="close-all" :disabled="tags.length === 0">
              {{ t('tag-view.actions.closeAll') }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { ArrowDown, Close } from '@element-plus/icons-vue'
import type { TagViewItem } from './tag-view.store'
import { useLocalization } from '@/modules/system/localization/localization'

const props = defineProps<{
  tags: readonly TagViewItem[]
  activePath: string
}>()

const emit = defineEmits<{
  navigate: [path: string]
  close: [path: string]
  'close-current': []
  'close-others': []
  'close-all': []
}>()

const historyRef = ref<HTMLElement>()
const { t } = useLocalization()
const hasCurrent = computed(() => props.tags.some((tag) => tag.path === props.activePath))

watch(
  [() => props.activePath, () => props.tags.length],
  async function revealActiveTag() {
    await nextTick()
    historyRef.value
      ?.querySelector<HTMLElement>('[aria-current="page"]')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  },
  { flush: 'post', immediate: true },
)

function handleCommand(command: string): void {
  if (command === 'close-current') {
    emit('close-current')
  } else if (command === 'close-others') {
    emit('close-others')
  } else if (command === 'close-all') {
    emit('close-all')
  }
}
</script>

<style lang="scss" scoped>
.tag-view {
  position: sticky;
  top: var(--app-shell-header-height);
  z-index: 19;
  display: flex;
  width: 100%;
  height: var(--tag-view-height);
  min-width: 0;
  align-items: stretch;
  border-bottom: 1px solid var(--line);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 8px 24px rgba(18, 60, 49, 0.04);
  backdrop-filter: blur(16px);
}

.tag-view__history {
  display: flex;
  min-width: 0;
  flex: 1 1 auto;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  padding: 7px 10px;
  scrollbar-color: var(--line) transparent;
  scrollbar-width: thin;
}

.tag-view__item {
  display: flex;
  height: 32px;
  flex: 0 0 auto;
  align-items: stretch;
  overflow: hidden;
  border: 1px solid var(--line);
  border-radius: 10px;
  color: var(--ink-soft);
  background: var(--surface);
  transition:
    border-color 0.18s ease,
    color 0.18s ease,
    background 0.18s ease;

  &:hover {
    border-color: var(--primary);
    color: var(--ink);
  }
}

.tag-view__item--active {
  border-color: var(--primary);
  color: var(--primary-dark);
  background: var(--primary-mist);
}

.tag-view__link,
.tag-view__close,
.tag-view__action-button {
  border: 0;
  color: inherit;
  background: transparent;
}

.tag-view__link {
  display: flex;
  min-width: 0;
  max-width: 220px;
  align-items: center;
  gap: 7px;
  padding: 0 8px 0 10px;
}

.tag-view__marker {
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: var(--line);
}

.tag-view__item--active .tag-view__marker {
  background: var(--primary-deep);
  box-shadow: 0 0 0 3px rgba(112, 207, 162, 0.22);
}

.tag-view__title {
  overflow: hidden;
  font-size: 12px;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tag-view__close {
  display: grid;
  width: 28px;
  place-items: center;
  padding: 0;
  opacity: 0.55;
  transition:
    opacity 0.18s ease,
    background 0.18s ease;

  &:hover {
    background: rgba(36, 107, 81, 0.1);
    opacity: 1;
  }

  svg {
    width: 13px;
    height: 13px;
  }
}

.tag-view__actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 7px 10px;
  border-left: 1px solid var(--line);
}

.tag-view__action-button {
  display: flex;
  height: 32px;
  align-items: center;
  gap: 7px;
  padding: 0 10px;
  border-radius: 10px;
  color: var(--ink-soft);
  font-size: 11px;
  font-weight: 800;
  transition:
    color 0.18s ease,
    background 0.18s ease;

  &:hover {
    color: var(--primary-dark);
    background: var(--primary-mist);
  }

  svg {
    width: 12px;
    height: 12px;
  }
}

@media (max-width: 479px) {
  .tag-view__history {
    padding-right: 6px;
    padding-left: 8px;
  }

  .tag-view__actions {
    padding-right: 6px;
    padding-left: 6px;
  }

  .tag-view__action-button {
    width: 34px;
    justify-content: center;
    padding: 0;

    span {
      display: none;
    }
  }
}
</style>
