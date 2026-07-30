<template>
  <div class="surface-card">
    <!-- 列表组件拥有搜索、分页和删除确认状态。 -->
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        placeholder="搜索类型、名称或字典值"
        size="large"
        @keyup.enter="search"
        @clear="search"
      />
      <span
        >共 <strong>{{ total }}</strong> 个字典项</span
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
    <el-table v-loading="loading" :data="records" row-key="id" empty-text="暂无字典项">
      <el-table-column prop="type" label="字典类型" min-width="180">
        <template #default="{ row }">
          <code class="code-chip">{{ row.type }}</code>
        </template>
      </el-table-column>
      <el-table-column prop="label" label="显示名称" min-width="150" />
      <el-table-column prop="value" label="字典值" min-width="170" />
      <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
      <el-table-column prop="sortOrder" label="排序" width="80" />
      <el-table-column label="状态" width="100">
        <template #default="{ row }">
          <el-tag :type="row.enabled ? 'success' : 'info'" round>
            {{ row.enabled ? '启用' : '停用' }}
          </el-tag>
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
import type { DictionarySummary } from '@scaffold/api-contract'
import { deleteDictionary, listDictionaries } from '@/modules/system/dictionaries/dictionaries.api'

const emit = defineEmits<{
  edit: [dictionary: DictionarySummary]
}>()

const records = ref<DictionarySummary[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10
const keyword = ref('')
const loading = ref(false)
const errorMessage = ref('')

async function load(): Promise<void> {
  // 加载失败时清空旧页，避免用户把过期字典项误认为本次查询结果。
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listDictionaries(pageNum.value, pageSize, keyword.value)
    if (result.status !== 0) {
      throw new Error(result.err || '字典加载失败')
    }
    records.value = result.list
    total.value = result.total
  } catch (error) {
    records.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '字典加载失败'
  } finally {
    loading.value = false
  }
}

function search(): void {
  pageNum.value = 1
  void load()
}

async function remove(dictionary: DictionarySummary): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除字典项“${dictionary.label}”吗？`, '删除字典项', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const result = await deleteDictionary(dictionary.id)
    if (result.status !== 0) {
      throw new Error('err' in result ? result.err : '删除失败')
    }
    ElMessage.success('字典项已删除')
    await load()
  } catch (error) {
    // 用户主动关闭确认框不是删除失败。
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value = error instanceof Error ? error.message : '删除失败'
    }
  }
}

// 供父页面在弹窗保存后刷新当前分页。
defineExpose({ reload: load })
onMounted(load)
</script>
