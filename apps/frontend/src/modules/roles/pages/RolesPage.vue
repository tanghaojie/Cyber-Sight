<template>
  <section class="management-page" aria-labelledby="roles-title">
    <header class="page-intro">
      <div><p class="page-kicker">ACCESS / POLICY</p><h2 id="roles-title">角色管理</h2><span>定义职责边界，并为每个角色配置可访问菜单。</span></div>
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate">新增角色</el-button>
    </header>
    <div class="surface-card">
      <div class="resource-toolbar"><el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索角色名称或编码" size="large" @keyup.enter="search" @clear="search" /><span>共 <strong>{{ total }}</strong> 个角色</span></div>
      <el-alert v-if="errorMessage" class="mx-5 mt-4 !w-auto" :title="errorMessage" type="error" show-icon :closable="false" />
      <el-table v-loading="loading" :data="records" row-key="id" empty-text="暂无角色">
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" min-width="170"><template #default="{ row }"><code class="code-chip">{{ row.code }}</code></template></el-table-column>
        <el-table-column prop="description" label="职责说明" min-width="230" show-overflow-tooltip />
        <el-table-column label="菜单范围" min-width="150"><template #default="{ row }"><span class="table-count">{{ row.menuIds.length }}</span><span class="table-muted ml-2">项权限</span></template></el-table-column>
        <el-table-column label="状态" width="100"><template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'" round>{{ row.enabled ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column label="更新时间" min-width="170"><template #default="{ row }"><span class="table-muted">{{ formatDate(row.updatedAt) }}</span></template></el-table-column>
        <el-table-column label="操作" width="112" fixed="right"><template #default="{ row }"><el-button circle text :icon="EditPen" @click="openEdit(row)" /><el-button circle text type="danger" :icon="Delete" @click="remove(row)" /></template></el-table-column>
      </el-table>
      <footer class="resource-footer"><el-pagination v-model:current-page="pageNum" :page-size="pageSize" :total="total" layout="prev, pager, next" background @current-change="load" /></footer>
    </div>

    <el-dialog v-model="dialogOpen" :title="editingId ? '编辑角色' : '新增角色'" width="min(660px, calc(100vw - 32px))" :close-on-click-modal="!saving">
      <el-form label-position="top" @submit.prevent="submit">
        <div class="form-columns">
          <el-form-item label="角色名称" required><el-input v-model.trim="form.name" placeholder="例如 内容运营" /></el-form-item>
          <el-form-item label="角色编码" required><el-input v-model.trim="form.code" placeholder="例如 CONTENT_OPERATOR" /></el-form-item>
          <el-form-item label="职责说明" class="sm:col-span-2"><el-input v-model="form.description" type="textarea" :rows="3" placeholder="说明该角色的责任范围" /></el-form-item>
          <el-form-item label="菜单权限" class="sm:col-span-2">
            <el-tree-select v-model="form.menuIds" class="w-full" :data="menuTree" multiple show-checkbox check-strictly node-key="value" :render-after-expand="false" placeholder="选择目录、菜单或外链按钮" />
          </el-form-item>
          <el-form-item label="角色状态" class="sm:col-span-2"><el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" /></el-form-item>
        </div>
        <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
        <div class="dialog-actions"><el-button @click="dialogOpen = false">取消</el-button><el-button native-type="submit" type="primary" :loading="saving">保存角色</el-button></div>
      </el-form>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { RoleRequest, RoleSummary } from '@scaffold/api-contract'
import { listMenuTreeOptions, type MenuTreeOption } from '../../menus/menu-options.js'
import { createRole, deleteRole, listRoles, updateRole } from '../roles.api.js'

const records = ref<RoleSummary[]>([])
const menuTree = ref<MenuTreeOption[]>([])
const total = ref(0), pageNum = ref(1), pageSize = 10
const keyword = ref(''), loading = ref(false), saving = ref(false), dialogOpen = ref(false)
const editingId = ref<number | null>(null), errorMessage = ref(''), formError = ref('')
const form = reactive<RoleRequest>({ name: '', code: '', description: '', enabled: true, menuIds: [] })

async function load(): Promise<void> {
  loading.value = true; errorMessage.value = ''
  try { const result = await listRoles(pageNum.value, pageSize, keyword.value); if (result.status !== 0) throw new Error(result.err || '角色加载失败'); records.value = result.list; total.value = result.total }
  catch (error) { records.value = []; total.value = 0; errorMessage.value = error instanceof Error ? error.message : '角色加载失败' }
  finally { loading.value = false }
}

function resetForm(): void { Object.assign(form, { name: '', code: '', description: '', enabled: true, menuIds: [] }) }
function openCreate(): void { editingId.value = null; resetForm(); formError.value = ''; dialogOpen.value = true }
function openEdit(row: RoleSummary): void { editingId.value = row.id; Object.assign(form, { name: row.name, code: row.code, description: row.description, enabled: row.enabled, menuIds: [...row.menuIds] }); formError.value = ''; dialogOpen.value = true }
function search(): void { pageNum.value = 1; void load() }

async function submit(): Promise<void> {
  saving.value = true; formError.value = ''
  try {
    if (!form.name || !/^[A-Z0-9_]{2,50}$/.test(form.code)) throw new Error('请填写角色名称，角色编码仅使用大写字母、数字和下划线')
    const payload: RoleRequest = { ...form, menuIds: [...form.menuIds] }
    const result = editingId.value ? await updateRole(editingId.value, payload) : await createRole(payload)
    if (result.status !== 0) throw new Error(result.err || '角色保存失败')
    dialogOpen.value = false; ElMessage.success('角色已保存'); await load()
  } catch (error) { formError.value = error instanceof Error ? error.message : '角色保存失败' }
  finally { saving.value = false }
}

async function remove(row: RoleSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除角色“${row.name}”吗？`, '删除角色', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    const result = await deleteRole(row.id); if (result.status !== 0) throw new Error('err' in result ? result.err : '删除失败')
    ElMessage.success('角色已删除'); await load()
  } catch (error) { if (error !== 'cancel' && error !== 'close') errorMessage.value = error instanceof Error ? error.message : '删除失败' }
}

function formatDate(value: string): string { return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }
onMounted(async function initialize() { try { menuTree.value = await listMenuTreeOptions() } catch { menuTree.value = [] }; await load() })
</script>
