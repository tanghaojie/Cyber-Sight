<template>
  <div class="surface-card">
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        placeholder="搜索用户名、姓名或邮箱"
        size="large"
        @keyup.enter="search"
        @clear="search"
      />
      <span>
        共 <strong>{{ total }}</strong> 位用户
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
    <el-table v-loading="loading" :data="records" row-key="id" empty-text="暂无用户">
      <el-table-column prop="username" label="用户名" min-width="130" />
      <el-table-column prop="displayName" label="姓名" min-width="130" />
      <el-table-column prop="email" label="邮箱" min-width="210" />
      <el-table-column label="角色" min-width="180">
        <template #default="{ row }">
          <div class="flex flex-wrap gap-1.5">
            <el-tag v-for="roleId in row.roleIds" :key="roleId" effect="plain" round>
              {{ roleName(roleId) }}
            </el-tag>
            <span v-if="!row.roleIds.length" class="table-muted">未分配</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" round>
            {{ row.enabled ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="更新时间" min-width="170">
        <template #default="{ row }">
          <span class="table-muted">{{ formatDate(row.updatedAt) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="112" fixed="right">
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
import type { UserSummary } from '@scaffold/api-contract'
import type { RoleOption } from '@/modules/roles/roles.api'
import { deleteUser, listUsers } from '@/modules/users/users.api'

const props = defineProps<{
  roleOptions: RoleOption[]
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

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listUsers(pageNum.value, pageSize, keyword.value)
    if (result.status !== 0) {
      throw new Error(result.err || '用户加载失败')
    }
    records.value = result.list
    total.value = result.total
  } catch (error) {
    records.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '用户加载失败'
  } finally {
    loading.value = false
  }
}

function search(): void {
  pageNum.value = 1
  void load()
}

function roleName(id: number): string {
  return props.roleOptions.find((role) => role.id === id)?.name ?? `角色 #${id}`
}

async function remove(user: UserSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除用户“${user.displayName}”吗？`, '删除用户', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const result = await deleteUser(user.id)
    if (result.status !== 0) {
      throw new Error('err' in result ? result.err : '删除失败')
    }
    ElMessage.success('用户已删除')
    await load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value = error instanceof Error ? error.message : '删除失败'
    }
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}

defineExpose({ reload: load })
onMounted(load)
</script>
