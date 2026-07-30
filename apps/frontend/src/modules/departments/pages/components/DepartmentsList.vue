<template>
  <div class="surface-card">
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        placeholder="搜索部门名称或编码"
        size="large"
      />
      <span
        >共 <strong>{{ records.length }}</strong> 个部门</span
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
    <el-table v-loading="loading" :data="visibleRecords" row-key="id" empty-text="暂无部门">
      <el-table-column prop="name" label="部门名称" min-width="180" />
      <el-table-column prop="code" label="部门编码" min-width="150">
        <template #default="{ row }"
          ><code class="code-chip">{{ row.code }}</code></template
        >
      </el-table-column>
      <el-table-column label="上级部门" min-width="150">
        <template #default="{ row }">{{ parentName(row.parentId) }}</template>
      </el-table-column>
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" round>
            {{ row.enabled ? '启用' : '停用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="150" fixed="right">
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
import type { DepartmentSummary } from '@scaffold/api-contract'
import { deleteDepartment, listDepartments } from '@/modules/departments/departments.api'

const emit = defineEmits<{
  create: [parentId: number]
  edit: [department: DepartmentSummary]
  loaded: [records: DepartmentSummary[]]
}>()
const records = ref<DepartmentSummary[]>([])
const keyword = ref('')
const loading = ref(false)
const errorMessage = ref('')
// 部门数量通常较小，当前在已加载的全量集合上执行即时前端过滤。
const visibleRecords = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  return query
    ? records.value.filter(
        (row) => row.name.toLowerCase().includes(query) || row.code.toLowerCase().includes(query),
      )
    : records.value
})

function parentName(parentId: number): string {
  return parentId === 0
    ? '根部门'
    : (records.value.find((row) => row.id === parentId)?.name ?? `部门 #${parentId}`)
}

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    records.value = await listDepartments()
  } catch (error) {
    records.value = []
    errorMessage.value = error instanceof Error ? error.message : '部门加载失败'
  } finally {
    loading.value = false
    // 无论成功或失败都同步父页面，避免弹窗继续使用上一次加载的父节点列表。
    emit('loaded', records.value)
  }
}

async function remove(department: DepartmentSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(
      `确定删除部门“${department.name}”吗？存在下级部门或用户归属时不能删除。`,
      '删除部门',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
    const result = await deleteDepartment(department.id)
    if (result.status !== 0) {
      throw new Error('err' in result ? result.err : '删除失败')
    }
    ElMessage.success('部门已删除')
    await load()
  } catch (error) {
    // 取消或关闭确认框属于正常交互，不覆盖当前页面错误状态。
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value = error instanceof Error ? error.message : '删除失败'
    }
  }
}

// 供父页面在部门弹窗保存后刷新全量记录。
defineExpose({ reload: load })
onMounted(load)
</script>
