<template>
  <el-dialog
    v-model="visible"
    class="system-settings-dialog"
    width="min(780px, calc(100vw - 32px))"
    align-center
    append-to-body
    :close-on-click-modal="false"
  >
    <template #header>
      <div class="settings-dialog__header">
        <div class="settings-dialog__header-icon"><Setting /></div>
        <div>
          <p>{{ t('settings.dialog.eyebrow') }}</p>
          <h2>{{ t('settings.dialog.title') }}</h2>
          <span>{{ t('settings.dialog.description') }}</span>
        </div>
      </div>
    </template>

    <div class="settings-dialog__content">
      <section
        class="settings-section settings-section--foundation"
        aria-labelledby="layout-heading"
      >
        <div class="settings-section__heading">
          <div>
            <span>{{ t('settings.section.foundationCode') }}</span>
            <h3 id="layout-heading">{{ t('settings.section.foundationTitle') }}</h3>
          </div>
          <small>{{ t('settings.section.foundationDescription') }}</small>
        </div>

        <div class="settings-layout-grid">
          <div class="settings-field">
            <span class="settings-field__label">{{
              t('settings.fields.navigationMenuStyle')
            }}</span>
            <div
              class="settings-style-options"
              role="radiogroup"
              :aria-label="t('settings.fields.navigationMenuStyle')"
            >
              <button
                v-for="option in navigationStyles"
                :key="option.value"
                class="settings-style-option"
                :class="{
                  'settings-style-option--active': draft.navigationMenuStyle === option.value,
                }"
                type="button"
                role="radio"
                :aria-checked="draft.navigationMenuStyle === option.value"
                @click="draft.navigationMenuStyle = option.value"
              >
                <span class="settings-style-option__preview" :class="`is-${option.value}`">
                  <i /><i /><i />
                </span>
                <b>{{ option.label }}</b>
                <small>{{ option.description }}</small>
              </button>
            </div>
          </div>

          <div class="settings-field">
            <span class="settings-field__label">{{ t('settings.fields.themeColor') }}</span>
            <div
              class="settings-theme-options"
              role="radiogroup"
              :aria-label="t('settings.fields.themeColor')"
            >
              <button
                v-for="option in themeColors"
                :key="option.value"
                class="settings-theme-option"
                :class="{ 'settings-theme-option--active': draft.themeColor === option.value }"
                type="button"
                role="radio"
                :aria-checked="draft.themeColor === option.value"
                @click="draft.themeColor = option.value"
              >
                <span
                  class="settings-theme-option__swatch"
                  :style="{ '--theme-swatch': option.color }"
                />
                <span>{{ option.label }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <section class="settings-section" aria-labelledby="experience-heading">
        <div class="settings-section__heading">
          <div>
            <span>{{ t('settings.section.experienceCode') }}</span>
            <h3 id="experience-heading">{{ t('settings.section.experienceTitle') }}</h3>
          </div>
          <small>{{ t('settings.section.experienceDescription') }}</small>
        </div>

        <div class="settings-switch-list">
          <label v-for="option in switchOptions" :key="option.key" class="settings-switch-row">
            <span class="settings-switch-row__icon"><component :is="option.icon" /></span>
            <span class="settings-switch-row__copy">
              <b>{{ option.label }}</b>
              <small>{{ option.description }}</small>
            </span>
            <el-switch v-model="draft[option.key]" />
          </label>
        </div>
      </section>

      <p class="settings-dialog__notice"><span />{{ t('settings.notice') }}</p>
    </div>

    <template #footer>
      <div class="settings-dialog__footer">
        <button class="settings-dialog__reset" type="button" @click="restoreDefaults">
          <RefreshLeft />{{ t('shared.actions.reset') }}
        </button>
        <div>
          <el-button text @click="handleCancel">{{ t('shared.actions.cancel') }}</el-button>
          <el-button type="primary" @click="handleSave">{{ t('settings.actions.save') }}</el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import {
  CollectionTag,
  Connection,
  Moon,
  OfficeBuilding,
  RefreshLeft,
  Setting,
} from '@element-plus/icons-vue'
import { useLocalization } from '@/modules/system/localization/localization'
import {
  DEFAULT_SYSTEM_SETTINGS,
  useSettingsStore,
  type NavigationMenuStyle,
  type SystemSettings,
  type ThemeColor,
} from './settings.store'

interface NavigationStyleOption {
  value: NavigationMenuStyle
  label: string
  description: string
}

interface ThemeColorOption {
  value: ThemeColor
  label: string
  color: string
}

type SwitchSettingKey = 'darkMode' | 'tagsView' | 'sidebarLogo' | 'dynamicTitle'

interface SwitchOption {
  key: SwitchSettingKey
  label: string
  description: string
  icon: typeof Moon
}

const visible = defineModel<boolean>({ default: false })
const settingsStore = useSettingsStore()
const draft = ref<SystemSettings>(createDraft(settingsStore.settings))
const { t } = useLocalization()
const navigationStyles = computed<readonly NavigationStyleOption[]>(() => [
  {
    value: 'sidebar',
    label: t('settings.navigation.sidebar.label'),
    description: t('settings.navigation.sidebar.description'),
  },
  {
    value: 'top',
    label: t('settings.navigation.top.label'),
    description: t('settings.navigation.top.description'),
  },
])
const themeColors = computed<readonly ThemeColorOption[]>(() => [
  { value: 'aurora', label: t('settings.theme.aurora'), color: '#70cfa2' },
  { value: 'ocean', label: t('settings.theme.ocean'), color: '#53a7d8' },
  { value: 'violet', label: t('settings.theme.violet'), color: '#8973e8' },
  { value: 'sunset', label: t('settings.theme.sunset'), color: '#df9463' },
])
const switchOptions = computed<readonly SwitchOption[]>(() => [
  {
    key: 'darkMode',
    label: t('settings.preferences.darkMode.label'),
    description: t('settings.preferences.darkMode.description'),
    icon: Moon,
  },
  {
    key: 'tagsView',
    label: t('settings.preferences.tagsView.label'),
    description: t('settings.preferences.tagsView.description'),
    icon: CollectionTag,
  },
  {
    key: 'sidebarLogo',
    label: t('settings.preferences.sidebarLogo.label'),
    description: t('settings.preferences.sidebarLogo.description'),
    icon: OfficeBuilding,
  },
  {
    key: 'dynamicTitle',
    label: t('settings.preferences.dynamicTitle.label'),
    description: t('settings.preferences.dynamicTitle.description'),
    icon: Connection,
  },
])

watch(visible, function synchronizeDraft(open) {
  if (open) {
    draft.value = createDraft(settingsStore.settings)
  }
})

function createDraft(source: Readonly<SystemSettings>): SystemSettings {
  return { ...source }
}

function handleCancel(): void {
  visible.value = false
}

function handleSave(): void {
  settingsStore.save(draft.value)
  visible.value = false
}

function restoreDefaults(): void {
  draft.value = createDraft(DEFAULT_SYSTEM_SETTINGS)
}
</script>

<style lang="scss">
.system-settings-dialog {
  --settings-ink: #17382e;
  --settings-muted: #70877d;
  --settings-line: #dbe8e1;
  --settings-panel: #f7fbf8;
  --settings-green: #246b51;

  max-width: 780px;
  background: radial-gradient(circle at 86% -12%, rgba(112, 207, 162, 0.22), transparent 32%), #fff;

  .el-dialog__header {
    padding: 28px 30px 18px;
  }

  .el-dialog__body {
    max-height: min(62vh, 600px);
    overflow-y: auto;
    padding: 6px 30px 10px;
  }

  .el-dialog__footer {
    padding: 18px 30px 26px;
  }

  .el-dialog__headerbtn {
    top: 20px;
    right: 22px;
    width: 36px;
    height: 36px;
    border: 1px solid var(--settings-line);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.74);
  }
}

.settings-dialog__header {
  display: flex;
  align-items: center;
  gap: 14px;

  p,
  h2,
  span {
    margin: 0;
  }

  p,
  span {
    color: var(--settings-muted);
  }

  p {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.16em;
  }

  h2 {
    margin-top: 3px;
    color: var(--settings-ink);
    font-family: var(--font-display);
    font-size: 26px;
    font-weight: 900;
    letter-spacing: -0.035em;
  }

  span {
    display: block;
    margin-top: 4px;
    font-size: 12px;
  }
}

.settings-dialog__header-icon,
.settings-switch-row__icon {
  display: grid;
  place-items: center;
}

.settings-dialog__header-icon {
  width: 48px;
  height: 48px;
  flex: 0 0 auto;
  border: 1px solid rgba(36, 107, 81, 0.18);
  border-radius: 16px;
  color: #fff;
  background: linear-gradient(145deg, #2e8061, #164937);
  box-shadow: 0 11px 24px rgba(36, 107, 81, 0.2);

  svg {
    width: 21px;
    height: 21px;
  }
}

.settings-dialog__content {
  display: grid;
  gap: 18px;
}

.settings-section {
  padding: 22px;
  border: 1px solid var(--settings-line);
  border-radius: 20px;
  background: #fff;
}

.settings-section--foundation {
  border-color: transparent;
  background:
    linear-gradient(var(--settings-panel), var(--settings-panel)) padding-box,
    linear-gradient(125deg, rgba(112, 207, 162, 0.58), rgba(219, 232, 225, 0.7)) border-box;
}

.settings-section__heading {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;

  span {
    display: block;
    color: var(--settings-green);
    font-size: 9px;
    font-weight: 900;
    letter-spacing: 0.16em;
  }

  h3 {
    margin: 5px 0 0;
    color: var(--settings-ink);
    font-family: var(--font-display);
    font-size: 18px;
    font-weight: 900;
    letter-spacing: -0.02em;
  }

  small {
    color: var(--settings-muted);
    font-size: 11px;
    text-align: right;
  }
}

.settings-layout-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(190px, 0.9fr);
  gap: 26px;
  margin-top: 22px;
}

.settings-field__label {
  display: block;
  margin-bottom: 10px;
  color: var(--settings-ink);
  font-size: 12px;
  font-weight: 800;
}

.settings-style-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.settings-style-option {
  min-width: 0;
  padding: 11px;
  border: 1px solid var(--settings-line);
  border-radius: 14px;
  color: var(--settings-muted);
  background: rgba(255, 255, 255, 0.72);
  text-align: left;
  transition:
    border-color 0.18s ease,
    box-shadow 0.18s ease,
    transform 0.18s ease;

  &:hover {
    border-color: rgba(36, 107, 81, 0.42);
    transform: translateY(-2px);
  }

  &--active {
    border-color: var(--settings-green);
    color: var(--settings-ink);
    box-shadow: 0 8px 18px rgba(36, 107, 81, 0.1);
  }

  b,
  small {
    display: block;
  }

  b {
    margin-top: 10px;
    font-size: 12px;
  }

  small {
    min-height: 28px;
    margin-top: 3px;
    font-size: 10px;
    line-height: 1.45;
  }
}

.settings-style-option__preview {
  display: grid;
  width: 100%;
  height: 45px;
  gap: 3px;
  padding: 5px;
  border: 1px solid #cfe0d7;
  border-radius: 8px;
  background: #fff;

  i {
    display: block;
    border-radius: 3px;
    background: #dbe9e1;
  }

  &.is-sidebar {
    grid-template-columns: 28% 1fr;
    grid-template-rows: 1fr 1fr;

    i:first-child {
      grid-row: 1 / span 2;
      background: #396f5c;
    }
  }

  &.is-top {
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 28% 1fr;

    i:first-child {
      grid-column: 1 / span 2;
      background: #396f5c;
    }
  }
}

.settings-theme-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.settings-theme-option {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 11px;
  color: var(--settings-muted);
  background: transparent;
  font-size: 11px;
  text-align: left;

  &:hover,
  &--active {
    border-color: var(--settings-line);
    color: var(--settings-ink);
    background: #fff;
  }

  &--active {
    box-shadow: 0 5px 12px rgba(23, 56, 46, 0.06);
  }
}

.settings-theme-option__swatch {
  width: 18px;
  height: 18px;
  flex: 0 0 auto;
  border: 2px solid #fff;
  border-radius: 50%;
  background: var(--theme-swatch);
  box-shadow: 0 0 0 1px color-mix(in srgb, var(--theme-swatch), #1a3d32 20%);
}

.settings-switch-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 9px;
  margin-top: 20px;
}

.settings-switch-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 11px;
  padding: 12px;
  border: 1px solid #edf3ef;
  border-radius: 15px;
  background: #fcfefd;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;

  &:has(.el-switch.is-checked) {
    border-color: rgba(112, 207, 162, 0.45);
    background: #f4fbf7;
  }
}

.settings-switch-row__icon {
  width: 36px;
  height: 36px;
  border-radius: 11px;
  color: var(--settings-green);
  background: #e7f7ef;

  svg {
    width: 17px;
    height: 17px;
  }
}

.settings-switch-row__copy {
  min-width: 0;

  b,
  small {
    display: block;
  }

  b {
    color: var(--settings-ink);
    font-size: 12px;
  }

  small {
    overflow: hidden;
    margin-top: 3px;
    color: var(--settings-muted);
    font-size: 10px;
    line-height: 1.4;
  }
}

.settings-dialog__notice {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0 2px;
  color: var(--settings-muted);
  font-size: 11px;
  line-height: 1.55;

  span {
    width: 7px;
    height: 7px;
    flex: 0 0 auto;
    margin-top: 5px;
    border-radius: 50%;
    background: var(--settings-green);
    box-shadow: 0 0 0 4px rgba(112, 207, 162, 0.2);
  }
}

.settings-dialog__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  > div {
    display: flex;
    gap: 8px;
  }

  .el-button--primary {
    min-width: 98px;
    border-color: var(--settings-green);
    background: var(--settings-green);
    box-shadow: 0 8px 16px rgba(36, 107, 81, 0.18);
  }
}

.settings-dialog__reset {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 4px;
  border: 0;
  color: var(--settings-muted);
  background: transparent;
  font-size: 12px;

  &:hover {
    color: var(--settings-green);
  }

  svg {
    width: 15px;
    height: 15px;
  }
}

@media (max-width: 640px) {
  .system-settings-dialog {
    .el-dialog__header {
      padding: 24px 20px 16px;
    }

    .el-dialog__body {
      max-height: 64vh;
      padding: 4px 20px 8px;
    }

    .el-dialog__footer {
      padding: 16px 20px 22px;
    }
  }

  .settings-dialog__header h2 {
    font-size: 23px;
  }

  .settings-section {
    padding: 18px;
    border-radius: 17px;
  }

  .settings-layout-grid,
  .settings-switch-list {
    grid-template-columns: 1fr;
  }

  .settings-layout-grid {
    gap: 20px;
  }

  .settings-dialog__footer {
    align-items: flex-start;
    flex-direction: column;

    > div {
      width: 100%;
      justify-content: flex-end;
    }
  }
}
</style>
