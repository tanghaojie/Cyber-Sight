<template>
  <div class="surface-card">
    <!-- 列表组件拥有搜索、分页和删除确认状态。 -->
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        :placeholder="t('roles.list.searchPlaceholder')"
        size="large"
        @keyup.enter="search"
        @clear="search"
      />
      <span>{{ t('roles.list.total', { count: total }) }}</span>
    </div>
    <el-alert
      v-if="errorMessage"
      class="mx-5 mt-4 !w-auto"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
    />
    <el-table v-loading="loading" :data="records" row-key="id" :empty-text="t('roles.list.empty')">
      <el-table-column prop="name" :label="t('roles.fields.name')" min-width="150" />
      <el-table-column prop="code" :label="t('roles.fields.code')" min-width="170">
        <template #default="{ row }">
          <code class="code-chip">{{ row.code }}</code>
        </template>
      </el-table-column>
      <el-table-column
        prop="description"
        :label="t('roles.fields.description')"
        min-width="230"
        show-overflow-tooltip
      />
      <el-table-column :label="t('roles.fields.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" round>
            {{ row.enabled ? t('localization.state.enabled') : t('localization.state.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('roles.fields.updatedAt')" min-width="170">
        <template #default="{ row }">
          <span class="table-muted">{{ formatDate(row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('roles.fields.actions')" width="112" fixed="right">
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
import type { RoleSummary } from '@scaffold/api-contract'
import { deleteRole, listRoles } from '@/modules/system/roles/roles.api'
import { useLocalization } from '@/modules/system/localization/localization'

const emit = defineEmits<{
  edit: [role: RoleSummary]
}>()

const records = ref<RoleSummary[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10
const keyword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const { formatDateTime, t } = useLocalization()

async function load(): Promise<void> {
  // 请求失败时清空旧记录，避免用户把过期列表误当成本次搜索结果。
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listRoles(pageNum.value, pageSize, keyword.value)
    if (result.status !== 0) {
      throw new Error(t('roles.errors.loadFailed'))
    }
    records.value = result.list
    total.value = result.total
  } catch (error) {
    records.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : t('roles.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

function search(): void {
  pageNum.value = 1
  void load()
}

async function remove(role: RoleSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('roles.confirm.deleteMessage', { name: role.name }),
      t('roles.confirm.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: t('localization.actions.delete'),
        cancelButtonText: t('localization.actions.cancel'),
      },
    )
    const result = await deleteRole(role.id)
    if (result.status !== 0) {
      throw new Error(t('roles.errors.deleteFailed'))
    }
    ElMessage.success(t('roles.messages.deleted'))
    await load()
  } catch (error) {
    // 用户关闭确认框不是业务错误，不显示失败提示。
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value = error instanceof Error ? error.message : t('roles.errors.deleteFailed')
    }
  }
}

function formatDate(value: string): string {
  return formatDateTime(value)
}

// 供父页面在弹窗保存后刷新列表。
defineExpose({ reload: load })
onMounted(load)
</script>
