<template>
  <section class="management-page" aria-labelledby="users-title">
    <header class="page-intro">
      <div>
        <p class="page-kicker">IDENTITY / DIRECTORY</p>
        <h2 id="users-title">用户管理</h2>
        <span>维护账号身份、启用状态与角色归属。</span>
      </div>
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate">新增用户</el-button>
    </header>

    <div class="surface-card">
      <div class="resource-toolbar">
        <el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索用户名、姓名或邮箱" size="large" @keyup.enter="search" @clear="search" />
        <span>共 <strong>{{ total }}</strong> 位用户</span>
      </div>
      <el-alert v-if="errorMessage" class="mx-5 mt-4 !w-auto" :title="errorMessage" type="error" show-icon :closable="false" />
      <el-table v-loading="loading" :data="records" row-key="id" empty-text="暂无用户">
        <el-table-column prop="username" label="用户名" min-width="130" />
        <el-table-column prop="displayName" label="姓名" min-width="130" />
        <el-table-column prop="email" label="邮箱" min-width="210" />
        <el-table-column label="角色" min-width="180">
          <template #default="{ row }">
            <div class="flex flex-wrap gap-1.5">
              <el-tag v-for="roleId in row.roleIds" :key="roleId" effect="plain" round>{{ roleName(roleId) }}</el-tag>
              <span v-if="!row.roleIds.length" class="table-muted">未分配</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100">
          <template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'" round>{{ row.enabled ? '启用' : '停用' }}</el-tag></template>
        </el-table-column>
        <el-table-column label="更新时间" min-width="170"><template #default="{ row }"><span class="table-muted">{{ formatDate(row.updatedAt) }}</span></template></el-table-column>
        <el-table-column label="操作" width="112" fixed="right">
          <template #default="{ row }"><el-button circle text :icon="EditPen" @click="openEdit(row)" /><el-button circle text type="danger" :icon="Delete" @click="remove(row)" /></template>
        </el-table-column>
      </el-table>
      <footer class="resource-footer"><el-pagination v-model:current-page="pageNum" :page-size="pageSize" :total="total" layout="prev, pager, next" background @current-change="load" /></footer>
    </div>

    <el-dialog v-model="dialogOpen" :title="editingId ? '编辑用户' : '新增用户'" width="min(640px, calc(100vw - 32px))" :close-on-click-modal="!saving">
      <el-form label-position="top" @submit.prevent="submit">
        <div class="form-columns">
          <el-form-item label="用户名" required><el-input v-model.trim="form.username" :disabled="Boolean(editingId)" placeholder="例如 zhangsan" /></el-form-item>
          <el-form-item label="姓名" required><el-input v-model.trim="form.displayName" placeholder="请输入姓名" /></el-form-item>
          <el-form-item label="邮箱" required><el-input v-model.trim="form.email" type="email" placeholder="name@example.com" /></el-form-item>
          <el-form-item :label="editingId ? '新密码（可选）' : '密码'" :required="!editingId"><el-input v-model="form.password" type="password" show-password placeholder="至少 8 个字符" /></el-form-item>
          <el-form-item label="角色" class="sm:col-span-2"><el-select v-model="form.roleIds" multiple class="w-full" placeholder="选择角色"><el-option v-for="role in roleOptions" :key="role.id" :label="role.name" :value="role.id" /></el-select></el-form-item>
          <el-form-item label="账号状态" class="sm:col-span-2"><el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" /></el-form-item>
        </div>
        <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
        <div class="dialog-actions"><el-button @click="dialogOpen = false">取消</el-button><el-button native-type="submit" type="primary" :loading="saving">保存用户</el-button></div>
      </el-form>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { UserCreate, UserSummary, UserUpdate } from '@scaffold/api-contract'
import { listRoleOptions, type RoleOption } from '../../roles/roles.api.js'
import { createUser, deleteUser, listUsers, updateUser } from '../users.api.js'

const records = ref<UserSummary[]>([])
const roleOptions = ref<RoleOption[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = 10
const keyword = ref('')
const loading = ref(false)
const saving = ref(false)
const dialogOpen = ref(false)
const editingId = ref<number | null>(null)
const errorMessage = ref('')
const formError = ref('')
const form = reactive({ username: '', displayName: '', email: '', password: '', roleIds: [] as number[], enabled: true })

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    const result = await listUsers(pageNum.value, pageSize, keyword.value)
    if (result.status !== 0) throw new Error(result.err || '用户加载失败')
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

function resetForm(): void {
  Object.assign(form, { username: '', displayName: '', email: '', password: '', roleIds: [], enabled: true })
}

function openCreate(): void { editingId.value = null; resetForm(); formError.value = ''; dialogOpen.value = true }
function openEdit(row: UserSummary): void { editingId.value = row.id; Object.assign(form, { username: row.username, displayName: row.displayName, email: row.email, password: '', roleIds: [...row.roleIds], enabled: row.enabled }); formError.value = ''; dialogOpen.value = true }
function search(): void { pageNum.value = 1; void load() }
function roleName(id: number): string { return roleOptions.value.find((role) => role.id === id)?.name ?? `角色 #${id}` }

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (!form.displayName || !form.email || (!editingId.value && (!form.username || form.password.length < 8))) throw new Error('请完整填写必填项，密码至少 8 个字符')
    const result = editingId.value
      ? await updateUser(editingId.value, { displayName: form.displayName, email: form.email, ...(form.password ? { password: form.password } : {}), roleIds: form.roleIds, enabled: form.enabled } satisfies UserUpdate)
      : await createUser({ username: form.username, displayName: form.displayName, email: form.email, password: form.password, roleIds: form.roleIds, enabled: form.enabled } satisfies UserCreate)
    if (result.status !== 0) throw new Error(result.err || '用户保存失败')
    dialogOpen.value = false
    ElMessage.success('用户已保存')
    await load()
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '用户保存失败'
  } finally {
    saving.value = false
  }
}

async function remove(row: UserSummary): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除用户“${row.displayName}”吗？`, '删除用户', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    const result = await deleteUser(row.id)
    if (result.status !== 0) throw new Error('err' in result ? result.err : '删除失败')
    ElMessage.success('用户已删除')
    await load()
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') errorMessage.value = error instanceof Error ? error.message : '删除失败'
  }
}

function formatDate(value: string): string { return new Intl.DateTimeFormat('zh-CN', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) }

onMounted(async function initialize() {
  try { roleOptions.value = await listRoleOptions() } catch { roleOptions.value = [] }
  await load()
})
</script>
