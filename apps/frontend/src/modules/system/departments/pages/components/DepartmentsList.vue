<template>
  <div class="surface-card">
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        :placeholder="t('departments.list.searchPlaceholder')"
        size="large"
      />
      <span>{{ t('departments.list.total', { count: records.length }) }}</span>
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
      :data="visibleTree"
      row-key="id"
      default-expand-all
      :tree-props="{ children: 'children' }"
      :empty-text="t('departments.list.empty')"
    >
      <el-table-column prop="name" :label="t('departments.fields.name')" min-width="180" />
      <el-table-column :label="t('departments.fields.parent')" min-width="150">
        <template #default="{ row }">{{ parentName(row.parentId) }}</template>
      </el-table-column>
      <el-table-column prop="sortOrder" :label="t('departments.fields.order')" width="80" />
      <el-table-column :label="t('departments.fields.status')" width="90">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" round>
            {{ row.enabled ? t('shared.state.enabled') : t('shared.state.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('departments.fields.actions')" width="150" fixed="right">
        <template #default="{ row }">
          <el-button circle text type="primary" :icon="Plus" @click="emit('create', row.id)" />
          <el-button circle text :icon="EditPen" @click="emit('edit', row)" />
          <el-button circle text type="danger" :icon="Delete" @click="remove(row)" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DepartmentSummary, EntityId } from '@cyber-ai-forge/api-contract'
import { deleteDepartment, listDepartments } from '@/modules/system/departments/departments.api'
import { buildDepartmentTree, filterDepartmentTree } from '../department-tree'
import { useLocalization } from '@/modules/system/localization/localization'

const emit = defineEmits<{
  create: [parentId: EntityId]
  edit: [department: DepartmentSummary]
  loaded: [records: DepartmentSummary[]]
}>()
const records = ref<DepartmentSummary[]>([])
const keyword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const { t } = useLocalization()
const departmentTree = computed(() => buildDepartmentTree(records.value))
// 部门数量通常较小，搜索在完整树快照上即时执行并保留命中节点的层级上下文。
const visibleTree = computed(() => filterDepartmentTree(departmentTree.value, keyword.value))

function parentName(parentId: EntityId | null): string {
  return parentId === null
    ? t('departments.root')
    : (records.value.find((row) => row.id === parentId)?.name ??
        t('departments.unknown', { id: parentId }))
}

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    records.value = await listDepartments()
  } catch (error) {
    records.value = []
    errorMessage.value = error instanceof Error ? error.message : t('departments.errors.loadFailed')
  } finally {
    loading.value = false
    // 无论成功或失败都同步父页面，避免弹窗继续使用上一次加载的父节点列表。
    emit('loaded', records.value)
  }
}

async function remove(department: DepartmentSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('departments.confirm.deleteMessage', { name: department.name }),
      t('departments.confirm.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: t('shared.actions.delete'),
        cancelButtonText: t('shared.actions.cancel'),
      },
    )
    const result = await deleteDepartment(department.id)
    if (result.status !== 0) {
      throw new Error(t('departments.errors.deleteFailed'))
    }
    ElMessage.success(t('departments.messages.deleted'))
    await load()
  } catch (error) {
    // 取消或关闭确认框属于正常交互，不覆盖当前页面错误状态。
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value =
        error instanceof Error ? error.message : t('departments.errors.deleteFailed')
    }
  }
}

// 供父页面在部门弹窗保存后刷新全量记录。
defineExpose({ reload: load })
onMounted(load)
</script>
