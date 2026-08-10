<template>
  <div class="surface-card">
    <!-- 列表组件拥有搜索、分页、删除确认和重新加载状态。 -->
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        :placeholder="t('users.list.searchPlaceholder')"
        size="large"
        @keyup.enter="search"
        @clear="search"
      />
      <span>
        {{ t('users.list.total', { count: total }) }}
      </span>
    </div>
    <el-alert
      v-if="errorMessage"
      class="mx-5 mt-4 !w-auto"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
    />
    <el-table v-loading="loading" :data="records" row-key="id" :empty-text="t('users.list.empty')">
      <el-table-column prop="username" :label="t('users.fields.username')" min-width="130" />
      <el-table-column prop="displayName" :label="t('users.fields.displayName')" min-width="130" />
      <el-table-column prop="email" :label="t('users.fields.email')" min-width="210" />
      <el-table-column :label="t('users.fields.roles')" min-width="180">
        <template #default="{ row }">
          <div class="flex flex-wrap gap-1.5">
            <el-tag v-for="roleId in row.roleIds" :key="roleId" effect="plain" round>
              {{ roleName(roleId) }}
            </el-tag>
            <span v-if="!row.roleIds.length" class="table-muted">{{
              t('users.list.unassigned')
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('users.fields.positions')" min-width="200">
        <template #default="{ row }">
          <div class="flex flex-wrap gap-1.5">
            <el-tag v-for="positionId in row.positionIds" :key="positionId" effect="plain" round>
              {{ positionName(positionId) }}
            </el-tag>
            <span v-if="!row.positionIds.length" class="table-muted">{{
              t('users.list.unassigned')
            }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column :label="t('users.fields.primaryDepartment')" min-width="150">
        <template #default="{ row }">
          {{ departmentName(row.primaryDepartmentId) }}
        </template>
      </el-table-column>
      <el-table-column :label="t('users.fields.status')" width="100">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" round>
            {{ row.enabled ? t('shared.state.enabled') : t('shared.state.disabled') }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column :label="t('users.fields.updatedAt')" min-width="170">
        <template #default="{ row }">
          <span class="table-muted">{{ formatDate(row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column :label="t('users.fields.actions')" width="112" fixed="right">
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
import type { DepartmentOption, EntityId, UserSummary } from '@cyber-ai-forge/api-contract'
import type { PositionOption } from '@/modules/system/positions/positions.api'
import type { RoleOption } from '@/modules/system/roles/roles.api'
import { deleteUser, listUsers } from '@/modules/system/users/users.api'
import { useLocalization } from '@/modules/system/localization/localization'

const props = defineProps<{
  roleOptions: RoleOption[]
  departmentOptions: DepartmentOption[]
  positionOptions: PositionOption[]
}>()
const emit = defineEmits<{
  edit: [user: UserSummary]
}>()

const records = ref<UserSummary[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10
const keyword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const { formatDateTime, t } = useLocalization()

async function load(): Promise<void> {
  // 每次请求先清空旧错误；失败时清空陈旧列表，避免把旧数据误认为最新结果。
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listUsers(pageNum.value, pageSize, keyword.value)
    if (result.status !== 0) {
      throw new Error(t('users.errors.loadFailed'))
    }
    records.value = result.list
    total.value = result.total
  } catch (error) {
    records.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : t('users.errors.loadFailed')
  } finally {
    loading.value = false
  }
}

function search(): void {
  pageNum.value = 1
  void load()
}

function roleName(id: EntityId): string {
  return (
    props.roleOptions.find((role) => role.id === id)?.name ?? t('users.list.unknownRole', { id })
  )
}

function departmentName(id: EntityId): string {
  return (
    props.departmentOptions.find((department) => department.id === id)?.name ??
    t('users.list.unknownDepartment', { id })
  )
}

function positionName(id: EntityId): string {
  return (
    props.positionOptions.find((position) => position.id === id)?.name ??
    t('users.list.unknownPosition', { id })
  )
}

async function remove(user: UserSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(
      t('users.confirm.deleteMessage', { name: user.displayName }),
      t('users.confirm.deleteTitle'),
      {
        type: 'warning',
        confirmButtonText: t('shared.actions.delete'),
        cancelButtonText: t('shared.actions.cancel'),
      },
    )
    const result = await deleteUser(user.id)
    if (result.status !== 0) {
      throw new Error(t('users.errors.deleteFailed'))
    }
    ElMessage.success(t('users.messages.deleted'))
    await load()
  } catch (error) {
    // Element Plus 用 cancel/close 字符串表示用户主动放弃，不应显示为删除错误。
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value = error instanceof Error ? error.message : t('users.errors.deleteFailed')
    }
  }
}

function formatDate(value: string): string {
  return formatDateTime(value)
}

// 父页面在弹窗保存后通过 reload 刷新当前页。
defineExpose({ reload: load })
onMounted(load)
</script>
