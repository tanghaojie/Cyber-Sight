<template>
  <section class="management-page" aria-labelledby="menus-title">
    <header class="page-intro">
      <div><p class="page-kicker">NAVIGATION / ROUTING</p><h2 id="menus-title">菜单管理</h2><span>用树形结构统一配置目录、站内页面与外部链接。</span></div>
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate(0)">新增根节点</el-button>
    </header>
    <div class="surface-card">
      <div class="resource-toolbar"><el-input v-model="keyword" clearable :prefix-icon="Search" placeholder="搜索菜单名称或编码" size="large" @keyup.enter="search" @clear="search" /><span>共 <strong>{{ total }}</strong> 个节点</span></div>
      <el-alert v-if="errorMessage" class="mx-5 mt-4 !w-auto" :title="errorMessage" type="error" show-icon :closable="false" />
      <el-table v-loading="loading" :data="treeRecords" row-key="id" default-expand-all :tree-props="{ children: 'children' }" empty-text="暂无菜单配置">
        <el-table-column label="名称" min-width="220"><template #default="{ row }"><div class="menu-name"><span class="menu-icon"><AppIcon :name="row.icon || fallbackIcon(row.type)" /></span><div><b>{{ row.name }}</b><small>{{ row.code }}</small></div></div></template></el-table-column>
        <el-table-column label="类型" width="110"><template #default="{ row }"><el-tag :type="tagType(row.type)" effect="light" round>{{ typeLabel(row.type) }}</el-tag></template></el-table-column>
        <el-table-column label="目标" min-width="230"><template #default="{ row }"><code v-if="row.type === 'menu'" class="code-chip">{{ row.path }} · {{ row.component }}</code><a v-else-if="row.type === 'button'" class="external-target" :href="row.externalUrl" target="_blank" rel="noopener noreferrer">{{ row.externalUrl }} ↗</a><span v-else class="table-muted">展开子节点</span></template></el-table-column>
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="90"><template #default="{ row }"><el-tag :type="row.enabled ? 'success' : 'info'" round>{{ row.enabled ? '启用' : '停用' }}</el-tag></template></el-table-column>
        <el-table-column label="操作" width="150" fixed="right"><template #default="{ row }"><el-button v-if="row.type === 'directory'" circle text type="primary" :icon="Plus" title="添加子节点" @click="openCreate(row.id)" /><el-button circle text :icon="EditPen" @click="openEdit(row)" /><el-button circle text type="danger" :icon="Delete" @click="remove(row)" /></template></el-table-column>
      </el-table>
      <footer class="resource-footer"><span class="table-muted">树形菜单一次加载全部节点，排序按目录层级生效</span></footer>
    </div>

    <el-dialog v-model="dialogOpen" :title="editingId ? '编辑菜单节点' : '新增菜单节点'" width="min(720px, calc(100vw - 32px))" :close-on-click-modal="!saving">
      <el-form label-position="top" @submit.prevent="submit">
        <div class="form-columns">
          <el-form-item label="名称" required><el-input v-model.trim="form.name" placeholder="例如 报表中心" /></el-form-item>
          <el-form-item label="编码" required><el-input v-model.trim="form.code" placeholder="例如 REPORT_CENTER" /></el-form-item>
          <el-form-item label="上级目录"><el-select v-model="form.parentId" class="w-full"><el-option label="根节点" :value="0" /><el-option v-for="directory in directoryOptions" :key="directory.id" :label="directory.name" :value="directory.id" :disabled="directory.id === editingId" /></el-select></el-form-item>
          <el-form-item label="节点类型" required><el-segmented v-model="form.type" :options="typeOptions" class="w-full" /></el-form-item>
          <el-form-item label="图标"><el-input v-model.trim="form.icon" placeholder="例如 menu、book、external" /></el-form-item>
          <el-form-item label="排序"><el-input-number v-model="form.sortOrder" :min="0" :max="9999" class="!w-full" /></el-form-item>
          <template v-if="form.type === 'menu'">
            <el-form-item label="站内路由" required><el-input v-model.trim="form.path" placeholder="例如 /reports" /></el-form-item>
            <el-form-item label="页面组件" required><el-select v-model="form.component" class="w-full" placeholder="选择已注册页面"><el-option v-for="option in viewComponentOptions" :key="option.value" :label="option.label" :value="option.value" /></el-select></el-form-item>
          </template>
          <el-form-item v-if="form.type === 'button'" label="外部链接" required class="sm:col-span-2"><el-input v-model.trim="form.externalUrl" placeholder="https://example.com" /></el-form-item>
          <el-form-item label="节点状态" class="sm:col-span-2"><el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" /></el-form-item>
        </div>
        <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
        <div class="dialog-actions"><el-button @click="dialogOpen = false">取消</el-button><el-button native-type="submit" type="primary" :loading="saving">保存节点</el-button></div>
      </el-form>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MenuRequest, MenuSummary } from '@scaffold/api-contract'
import AppIcon from '../../../components/AppIcon.vue'
import { viewComponentOptions } from '../../../config/app.config.js'
import { useNavigationStore } from '../../navigation/index.js'
import { buildMenuTree, type MenuTreeRecord } from '../menu-tree.js'
import { createMenu, deleteMenu, listAllMenus, updateMenu } from '../menus.api.js'

type MenuType = MenuSummary['type']
interface MenuForm { parentId: number; name: string; code: string; path: string; component: string; externalUrl: string; icon: string; sortOrder: number; type: MenuType; enabled: boolean }

const records = ref<MenuSummary[]>([])
const total = ref(0)
const keyword = ref(''), loading = ref(false), saving = ref(false), dialogOpen = ref(false)
const editingId = ref<number | null>(null), errorMessage = ref(''), formError = ref('')
const navigation = useNavigationStore()
const form = reactive<MenuForm>({ parentId: 0, name: '', code: '', path: '', component: '', externalUrl: '', icon: '', sortOrder: 0, type: 'menu', enabled: true })
const typeOptions = [{ label: '目录', value: 'directory' }, { label: '菜单', value: 'menu' }, { label: '外链按钮', value: 'button' }]
const treeRecords = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return buildMenuTree(records.value)
  const byId = new Map(records.value.map((record) => [record.id, record]))
  const visibleIds = new Set<number>()
  for (const record of records.value) {
    if (!record.name.toLowerCase().includes(query) && !record.code.toLowerCase().includes(query)) continue
    visibleIds.add(record.id)
    let parentId = record.parentId
    while (parentId > 0 && !visibleIds.has(parentId)) {
      visibleIds.add(parentId)
      parentId = byId.get(parentId)?.parentId ?? 0
    }
  }
  return buildMenuTree(records.value.filter((record) => visibleIds.has(record.id)))
})
const directoryOptions = computed(() => records.value.filter((record) => record.type === 'directory'))

async function load(): Promise<void> {
  loading.value = true; errorMessage.value = ''
  try { records.value = await listAllMenus(); total.value = records.value.length }
  catch (error) { records.value = []; total.value = 0; errorMessage.value = error instanceof Error ? error.message : '菜单加载失败' }
  finally { loading.value = false }
}

function resetForm(parentId = 0): void { Object.assign(form, { parentId, name: '', code: '', path: '', component: '', externalUrl: '', icon: '', sortOrder: 0, type: 'menu', enabled: true }) }
function openCreate(parentId: number): void { editingId.value = null; resetForm(parentId); formError.value = ''; dialogOpen.value = true }
function openEdit(row: MenuTreeRecord): void { editingId.value = row.id; Object.assign(form, { parentId: row.parentId, name: row.name, code: row.code, path: row.path, component: row.component, externalUrl: row.externalUrl, icon: row.icon, sortOrder: row.sortOrder, type: row.type, enabled: row.enabled }); formError.value = ''; dialogOpen.value = true }
function search(): void { /* keyword filtering is computed locally to preserve ancestors */ }

function payload(): MenuRequest {
  const common = { parentId: form.parentId, name: form.name, code: form.code, icon: form.icon, sortOrder: form.sortOrder, enabled: form.enabled }
  if (form.type === 'directory') return { ...common, type: 'directory', path: '', component: '', externalUrl: '' }
  if (form.type === 'button') return { ...common, type: 'button', path: '', component: '', externalUrl: form.externalUrl }
  return { ...common, type: 'menu', path: form.path, component: form.component, externalUrl: '' }
}

async function submit(): Promise<void> {
  saving.value = true; formError.value = ''
  try {
    if (!form.name || !/^[A-Z0-9_]{2,80}$/.test(form.code)) throw new Error('请填写名称，编码仅使用大写字母、数字和下划线')
    if (form.type === 'menu' && (!form.path.startsWith('/') || !form.component)) throw new Error('菜单必须配置以 / 开头的站内路由和页面组件')
    if (form.type === 'button' && !/^https?:\/\//i.test(form.externalUrl)) throw new Error('外链按钮必须配置 http 或 https 地址')
    const result = editingId.value ? await updateMenu(editingId.value, payload()) : await createMenu(payload())
    if (result.status !== 0) throw new Error(result.err || '菜单保存失败')
    dialogOpen.value = false; ElMessage.success('菜单节点已保存'); await load(); await navigation.load(true)
  } catch (error) { formError.value = error instanceof Error ? error.message : '菜单保存失败' }
  finally { saving.value = false }
}

async function remove(row: MenuTreeRecord): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除“${row.name}”吗？目录必须先清空子节点。`, '删除菜单节点', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
    const result = await deleteMenu(row.id); if (result.status !== 0) throw new Error('err' in result ? result.err : '删除失败')
    ElMessage.success('菜单节点已删除'); await load(); await navigation.load(true)
  } catch (error) { if (error !== 'cancel' && error !== 'close') errorMessage.value = error instanceof Error ? error.message : '删除失败' }
}

function typeLabel(type: MenuType): string { return ({ directory: '目录', menu: '菜单', button: '外链' } as const)[type] }
function tagType(type: MenuType): 'success' | 'warning' | 'info' { return type === 'menu' ? 'success' : type === 'button' ? 'warning' : 'info' }
function fallbackIcon(type: MenuType): string { return type === 'directory' ? 'layers' : type === 'button' ? 'external' : 'menu' }
watch(() => form.type, function clearUnusedFields(type) { if (type !== 'menu') { form.path = ''; form.component = '' }; if (type !== 'button') form.externalUrl = '' })
onMounted(load)
</script>

<style scoped>
.menu-name{display:flex;align-items:center;gap:11px}.menu-name b{display:block;color:var(--ink);font-size:13px}.menu-name small{display:block;margin-top:3px;color:var(--muted);font-size:9px;letter-spacing:.06em}.menu-icon{display:grid;width:34px;height:34px;place-items:center;border-radius:11px;color:var(--primary-deep);background:var(--primary-mist)}.external-target{display:block;max-width:280px;overflow:hidden;color:var(--primary-deep);font-size:11px;text-overflow:ellipsis;white-space:nowrap}
</style>
