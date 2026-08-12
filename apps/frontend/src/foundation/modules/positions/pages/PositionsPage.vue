<template>
  <section class="management-page positions-page" aria-labelledby="positions-title">
    <header class="position-hero">
      <div class="position-hero__copy">
        <span class="position-hero__kicker">{{ t('positions.page.kicker') }}</span>
        <h1 id="positions-title">{{ t('positions.page.title') }}</h1>
        <p>{{ t('positions.page.description') }}</p>
      </div>
      <div class="position-hero__signal">
        <span class="position-hero__signal-dot" aria-hidden="true" />
        <strong>{{ activeCount }}</strong>
        <span>{{ t('positions.page.activeLabel') }}</span>
      </div>
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate">
        {{ t('positions.page.add') }}
      </el-button>
    </header>

    <PositionsList
      ref="positionsList"
      :department-options="departmentOptions"
      @edit="openEdit"
      @active-count="activeCount = $event"
    />
    <PositionDialog
      v-model="dialogOpen"
      :position="editingPosition"
      :department-options="departmentOptions"
      @saved="refreshList"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { DepartmentOption, PositionSummary } from '@cyber-ai-forge/api-contract'
import { listDepartmentOptions } from '@/foundation/modules/departments/departments.api'
import PositionDialog from './components/PositionDialog.vue'
import PositionsList from './components/PositionsList.vue'
import { useLocalization } from '@/foundation/modules/localization/localization'

const { t } = useLocalization()
const positionsList = ref<InstanceType<typeof PositionsList> | null>(null)
const departmentOptions = ref<DepartmentOption[]>([])
const editingPosition = ref<PositionSummary | null>(null)
const dialogOpen = ref(false)
const activeCount = ref(0)

function openCreate(): void {
  editingPosition.value = null
  dialogOpen.value = true
}

function openEdit(position: PositionSummary): void {
  editingPosition.value = position
  dialogOpen.value = true
}

async function refreshList(): Promise<void> {
  await positionsList.value?.reload()
}

onMounted(async function loadDepartmentOptions() {
  try {
    departmentOptions.value = await listDepartmentOptions()
  } catch {
    departmentOptions.value = []
  }
})
</script>

<style scoped lang="scss">
.positions-page {
  --position-ink: #17242a;
  --position-mint: #bde9d8;
  --position-amber: #f5c66d;
}

.position-hero {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: end;
  gap: 28px;
  overflow: hidden;
  min-height: 188px;
  padding: 34px 38px;
  border: 1px solid rgb(189 233 216 / 70%);
  border-radius: 22px;
  background:
    radial-gradient(circle at 92% 14%, rgb(245 198 109 / 40%), transparent 22%),
    linear-gradient(120deg, #17242a 0%, #23434a 62%, #2d5b5a 100%);
  color: #f5fbf7;
  box-shadow: 0 22px 48px rgb(23 36 42 / 17%);
}

.position-hero::after {
  position: absolute;
  right: 12%;
  bottom: -100px;
  width: 260px;
  height: 260px;
  border: 1px solid rgb(189 233 216 / 25%);
  border-radius: 50%;
  content: '';
  box-shadow:
    0 0 0 18px rgb(189 233 216 / 5%),
    0 0 0 46px rgb(189 233 216 / 4%);
}

.position-hero__copy,
.position-hero__signal,
.position-hero .el-button {
  position: relative;
  z-index: 1;
}

.position-hero__kicker {
  display: block;
  color: var(--position-mint);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.14em;
}

.position-hero h1 {
  margin: 10px 0 7px;
  color: #fff;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(28px, 4vw, 46px);
  font-weight: 500;
  letter-spacing: -0.04em;
}

.position-hero p {
  max-width: 600px;
  margin: 0;
  color: rgb(245 251 247 / 72%);
  font-size: 14px;
  line-height: 1.7;
}

.position-hero__signal {
  display: grid;
  grid-template-columns: auto auto;
  align-items: center;
  column-gap: 10px;
  min-width: 154px;
  padding: 14px 18px;
  border: 1px solid rgb(189 233 216 / 26%);
  border-radius: 14px;
  background: rgb(8 22 27 / 23%);
}

.position-hero__signal-dot {
  grid-row: span 2;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--position-amber);
  box-shadow: 0 0 0 5px rgb(245 198 109 / 17%);
}

.position-hero__signal strong {
  font-size: 24px;
  line-height: 1;
}

.position-hero__signal span:last-child {
  color: rgb(245 251 247 / 63%);
  font-size: 11px;
}

.position-hero .el-button {
  --el-button-bg-color: var(--position-mint);
  --el-button-border-color: var(--position-mint);
  --el-button-text-color: var(--position-ink);
  --el-button-hover-bg-color: #d5f6e8;
  --el-button-hover-border-color: #d5f6e8;
  --el-button-hover-text-color: var(--position-ink);
}

@media (max-width: 760px) {
  .position-hero {
    grid-template-columns: 1fr auto;
    padding: 26px;
  }

  .position-hero__copy {
    grid-column: 1 / -1;
  }
}
</style>
