<template>
  <div class="surface-card">
    <!-- 列表组件拥有搜索、分页和删除确认状态。 -->
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        placeholder="搜索角色名称或编码"
        size="large"
        @keyup.enter="search"
        @clear="search"
      />
      <span
        >共 <strong>{{ total }}</strong> 个角色</span
      >
    </div>
    <el-alert
      v-if="errorMessage"
      class="mx-5 mt-4 !w-auto"
      :title="errorMessage"
      type="error"
      show-icon
      :closable="false"
    />
    <el-table v-loading="loading" :data="records" row-key="id" empty-text="暂无角色">
      <el-table-column prop="name" label="角色名称" min-width="150" />
      <el-table-column prop="code" label="角色编码" min-width="170">
        <template #default="{ row }">
          <code class="code-chip">{{ row.code }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="description" label="职责说明" min-width="230" show-overflow-tooltip />
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
import type { RoleSummary } from '@scaffold/api-contract'
import { deleteRole, listRoles } from '@/modules/roles/roles.api'

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

async function load(): Promise<void> {
  // 请求失败时清空旧记录，避免用户把过期列表误当成本次搜索结果。
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listRoles(pageNum.value, pageSize, keyword.value)
    if (result.status !== 0) {
      throw new Error(result.err || '角色加载失败')
    }
    records.value = result.list
    total.value = result.total
  } catch (error) {
    records.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '角色加载失败'
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
    await ElMessageBox.confirm(`确定删除角色“${role.name}”吗？`, '删除角色', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const result = await deleteRole(role.id)
    if (result.status !== 0) {
      throw new Error('err' in result ? result.err : '删除失败')
    }
    ElMessage.success('角色已删除')
    await load()
  } catch (error) {
    // 用户关闭确认框不是业务错误，不显示失败提示。
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

// 供父页面在弹窗保存后刷新列表。
defineExpose({ reload: load })
onMounted(load)
</script>
