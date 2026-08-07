<template>
  <div class="surface-card positions-list">
    <div class="resource-toolbar positions-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        :placeholder="t('positions.list.searchPlaceholder')"
        size="large"
        @keyup.enter="search"
        @clear="search"
      />
      <el-select
        v-model="departmentId"
        clearable
        :placeholder="t('positions.list.departmentPlaceholder')"
        size="large"
        @change="search"
      >
        <el-option
          v-for="department in departmentOptions"
          :key="department.id"
          :label="department.name"
          :value="department.id"
        />
      </el-select>
      <span>{{ t('positions.list.total', { count: total }) }}</span>
    </div>
    <el-alert
      v-if="errorMessage"
      class="mx-5 mt-4 !w-auto"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
    />
    <el-table
      v-loading="loading"
      :data="records"
      row-key="id"
      :empty-text="t('positions.list.empty')"
    >
      <el-table-column prop="name" :label="t('positions.fields.name')" min-width="180">
        <template #default="{ row }">
          <div class="position-name-cell">
            <span class="position-name-cell__mark" aria-hidden="true" />
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('positions.fields.department')" min-width="160">
        <template #default="{ row }">
          {{ departmentName(row.departmentId) }}
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        :label="t('positions.fields.description')"
        min-width="240"
        show-overflow-tooltip
      />
      <el-table-column prop="sortOrder" :label="t('positions.fields.order')" width="80" />
      <el-table-column :label="t('positions.fields.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" round>
            {{ row.enabled ? t('shared.state.enabled') : t('shared.state.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('positions.fields.updatedAt')" min-width="170">
        <template #default="{ row }">
          <span class="table-muted">{{ formatDate(row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('positions.fields.actions')" width="112" fixed="right">
        <template #default="{ row }">
          <el-button circle text :icon="EditPen" @click="emit('edit', row)" />
          <el-button circle text type="danger" :icon="Delete" @click="remove(row)" />
        </template>
      </el-table-column>
    </el-table>
    <footer class="resource-footer">
      <el-pagination
        v-model:current-page="pageNum"
        :page-size="pageSize"
        :total="total"
        layout="prev, pager, next"
        background
        @current-change="load"
      />
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Delete, EditPen, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DepartmentOption, PositionSummary } from '@scaffold/api-contract'
import { deletePosition, listPositions } from '@/modules/system/positions/positions.api'
import { useLocalization } from '@/modules/system/localization/localization'

const props = defineProps<{
  departmentOptions: DepartmentOption[]
}>()
const emit = defineEmits<{
  edit: [position: PositionSummary]
  'active-count': [count: number]
}>()

const records = ref<PositionSummary[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10
const keyword = ref('')
const departmentId = ref<number | undefined>()
const loading = ref(false)
const errorMessage = ref('')
const { formatDateTime, t } = useLocalization()

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listPositions(pageNum.value, pageSize, keyword.value, departmentId.value)
    if (result.status !== 0) {
      throw new Error(t('positions.errors.loadFailed'))
    }
    records.value = result.list
    total.value = result.total
    emit('active-count', records.value.filter((row) => row.enabled).length)
  } catch (error) {
    records.value = []
    total.value = 0
    emit('active-count', 0)
    errorMessage.value = error instanceof Error ? error.message : t('positions.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

function search(): void {
  pageNum.value = 1
  void load()
}

function departmentName(id: number): string {
  return props.departmentOptions.find((department) => department.id === id)?.name ?? `#${id}`
}

async function remove(position: PositionSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('positions.confirm.deleteMessage', { name: position.name }),
      t('positions.confirm.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: t('shared.actions.delete'),
        cancelButtonText: t('shared.actions.cancel'),
      },
    )
    const result = await deletePosition(position.id)
    if (result.status !== 0) {
      throw new Error(t('positions.errors.deleteFailed'))
    }
    ElMessage.success(t('positions.messages.deleted'))
    await load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value =
        error instanceof Error ? error.message : t('positions.errors.deleteFailed')
    }
  }
}

function formatDate(value: string): string {
  return formatDateTime(value)
}

defineExpose({ reload: load })
onMounted(load)
</script>

<style scoped lang="scss">
.positions-toolbar {
  grid-template-columns: minmax(220px, 1fr) minmax(180px, 240px) auto;
}

.position-name-cell {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-weight: 650;
}

.position-name-cell__mark {
  width: 9px;
  height: 9px;
  border-radius: 2px;
  background: #d7a448;
  box-shadow: 4px 4px 0 #c6e7d9;
  transform: rotate(45deg);
}

@media (max-width: 700px) {
  .positions-toolbar {
    grid-template-columns: 1fr;
  }
}
</style>
