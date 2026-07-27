<template>
  <section class="management-page" aria-labelledby="dictionaries-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate">新增字典项</el-button>
    </header>
    <div class="surface-card">
      <div class="resource-toolbar">
        <el-input
          v-model="keyword"
          clearable
          :prefix-icon="Search"
          placeholder="搜索类型、名称或字典值"
          size="large"
          @keyup.enter="search"
          @clear="search"
        /><span
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
        <el-table-column prop="type" label="字典类型" min-width="180"
          ><template #default="{ row }"
            ><code class="code-chip">{{ row.type }}</code></template
          ></el-table-column
        >
        <el-table-column prop="label" label="显示名称" min-width="150" />
        <el-table-column prop="value" label="字典值" min-width="170" />
        <el-table-column prop="remark" label="备注" min-width="220" show-overflow-tooltip />
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="100"
          ><template #default="{ row }"
            ><el-tag :type="row.enabled ? 'success' : 'info'" round>{{
              row.enabled ? '启用' : '停用'
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column label="更新时间" min-width="170"
          ><template #default="{ row }"
            ><span class="table-muted">{{ formatDate(row.updatedAt) }}</span></template
          ></el-table-column
        >
        <el-table-column label="操作" width="112" fixed="right"
          ><template #default="{ row }"
            ><el-button circle text :icon="EditPen" @click="openEdit(row)" /><el-button
              circle
              text
              type="danger"
              :icon="Delete"
              @click="remove(row)" /></template
        ></el-table-column>
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

    <el-dialog
      v-model="dialogOpen"
      :title="editingId ? '编辑字典项' : '新增字典项'"
      width="min(640px, calc(100vw - 32px))"
      :close-on-click-modal="!saving"
    >
      <el-form label-position="top" @submit.prevent="submit">
        <div class="form-columns">
          <el-form-item label="字典类型" required
            ><el-input v-model.trim="form.type" placeholder="例如 order_status"
          /></el-form-item>
          <el-form-item label="显示名称" required
            ><el-input v-model.trim="form.label" placeholder="例如 待处理"
          /></el-form-item>
          <el-form-item label="字典值" required
            ><el-input v-model.trim="form.value" placeholder="例如 pending"
          /></el-form-item>
          <el-form-item label="排序"
            ><el-input-number v-model="form.sortOrder" :min="0" :max="9999" class="!w-full"
          /></el-form-item>
          <el-form-item label="备注" class="sm:col-span-2"
            ><el-input
              v-model="form.remark"
              type="textarea"
              :rows="3"
              placeholder="补充该字典项的使用说明"
          /></el-form-item>
          <el-form-item label="字典状态" class="sm:col-span-2"
            ><el-switch v-model="form.enabled" active-text="启用" inactive-text="停用"
          /></el-form-item>
        </div>
        <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
        <div class="dialog-actions">
          <el-button @click="dialogOpen = false">取消</el-button
          ><el-button native-type="submit" type="primary" :loading="saving">保存字典项</el-button>
        </div>
      </el-form>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { DictionaryRequest, DictionarySummary } from '@scaffold/api-contract'
import {
  createDictionary,
  deleteDictionary,
  listDictionaries,
  updateDictionary,
} from '../dictionaries.api.js'

const records = ref<DictionarySummary[]>([])
const total = ref(0),
  pageNum = ref(1),
  pageSize = 10
const keyword = ref(''),
  loading = ref(false),
  saving = ref(false),
  dialogOpen = ref(false)
const editingId = ref<number | null>(null),
  errorMessage = ref(''),
  formError = ref('')
const form = reactive<DictionaryRequest>({
  type: '',
  label: '',
  value: '',
  sortOrder: 0,
  enabled: true,
  remark: '',
})

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listDictionaries(pageNum.value, pageSize, keyword.value)
    if (result.status !== 0) throw new Error(result.err || '字典加载失败')
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

function resetForm(): void {
  Object.assign(form, { type: '', label: '', value: '', sortOrder: 0, enabled: true, remark: '' })
}
function openCreate(): void {
  editingId.value = null
  resetForm()
  formError.value = ''
  dialogOpen.value = true
}
function openEdit(row: DictionarySummary): void {
  editingId.value = row.id
  Object.assign(form, {
    type: row.type,
    label: row.label,
    value: row.value,
    sortOrder: row.sortOrder,
    enabled: row.enabled,
    remark: row.remark,
  })
  formError.value = ''
  dialogOpen.value = true
}
function search(): void {
  pageNum.value = 1
  void load()
}

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (!form.type || !form.label || !form.value)
      throw new Error('请完整填写字典类型、显示名称和字典值')
    const payload: DictionaryRequest = { ...form }
    const result = editingId.value
      ? await updateDictionary(editingId.value, payload)
      : await createDictionary(payload)
    if (result.status !== 0) throw new Error(result.err || '字典保存失败')
    dialogOpen.value = false
    ElMessage.success('字典项已保存')
    await load()
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '字典保存失败'
  } finally {
    saving.value = false
  }
}

async function remove(row: DictionarySummary): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除字典项“${row.label}”吗？`, '删除字典项', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const result = await deleteDictionary(row.id)
    if (result.status !== 0) throw new Error('err' in result ? result.err : '删除失败')
    ElMessage.success('字典项已删除')
    await load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close')
      errorMessage.value = error instanceof Error ? error.message : '删除失败'
  }
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(
    new Date(value),
  )
}
onMounted(load)
</script>
