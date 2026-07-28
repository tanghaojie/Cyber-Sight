<template>
  <section class="management-page" aria-labelledby="menus-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate(0)"> 新增 </el-button>
    </header>
    <div class="surface-card">
      <div class="resource-toolbar">
        <el-input
          v-model="keyword"
          clearable
          :prefix-icon="Search"
          placeholder="搜索菜单名称"
          size="large"
          @keyup.enter="search"
          @clear="search"
        /><span
          >共 <strong>{{ total }}</strong> 个节点</span
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
      <el-table
        v-loading="loading"
        :data="treeRecords"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
        empty-text="暂无菜单配置"
      >
        <el-table-column label="名称" min-width="220">
          <template #default="{ row }">
            <div class="menu-name">
              <span class="menu-icon"><AppIcon :name="row.icon || fallbackIcon(row.type)" /></span>
              <b>{{ row.name }}</b>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="110"
          ><template #default="{ row }"
            ><el-tag :type="tagType(row.type)" effect="light" round>{{
              typeLabel(row.type)
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column label="目标" min-width="230"
          ><template #default="{ row }"
            ><code v-if="row.type === 'menu'" class="code-chip"
              >{{ row.path }} · {{ row.component }}</code
            ><a
              v-else-if="row.type === 'button'"
              class="external-target"
              :href="row.externalUrl"
              target="_blank"
              rel="noopener noreferrer"
              >{{ row.externalUrl }} ↗</a
            ><code v-else class="code-chip">{{ row.path || '待配置站内路由' }}</code></template
          ></el-table-column
        >
        <el-table-column prop="sortOrder" label="排序" width="80" />
        <el-table-column label="状态" width="90"
          ><template #default="{ row }"
            ><el-tag :type="row.enabled ? 'success' : 'info'" round>{{
              row.enabled ? '启用' : '停用'
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column label="操作" width="150" fixed="right"
          ><template #default="{ row }"
            ><el-button
              v-if="row.type === 'directory'"
              circle
              text
              type="primary"
              :icon="Plus"
              title="添加子节点"
              @click="openCreate(row.id)" /><el-button
              circle
              text
              :icon="EditPen"
              @click="openEdit(row)" /><el-button
              circle
              text
              type="danger"
              :icon="Delete"
              @click="remove(row)" /></template
        ></el-table-column>
      </el-table>
      <footer class="resource-footer">
        <span class="table-muted">树形菜单一次加载全部节点，排序按目录层级生效</span>
      </footer>
    </div>

    <el-dialog
      v-model="dialogOpen"
      :title="editingId ? '编辑菜单节点' : '新增菜单节点'"
      width="min(720px, calc(100vw - 32px))"
      :close-on-click-modal="!saving"
    >
      <el-form label-position="top" @submit.prevent="submit">
        <div class="form-columns">
          <el-form-item label="名称" required
            ><el-input v-model.trim="form.name" placeholder="例如 报表中心"
          /></el-form-item>
          <el-form-item label="上级目录"
            ><el-select v-model="form.parentId" class="w-full"
              ><el-option label="根节点" :value="0" /><el-option
                v-for="directory in directoryOptions"
                :key="directory.id"
                :label="directory.name"
                :value="directory.id"
                :disabled="directory.id === editingId" /></el-select
          ></el-form-item>
          <el-form-item label="节点类型" required
            ><el-segmented v-model="form.type" :options="typeOptions" class="w-full"
          /></el-form-item>
          <el-form-item label="图标">
            <el-select
              v-model="form.icon"
              class="w-full"
              clearable
              filterable
              placeholder="选择图标"
            >
              <el-option
                v-for="option in iconOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                <span class="icon-option">
                  <AppIcon :name="option.value" />
                  <span>{{ option.label }}</span>
                </span>
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="form.type !== 'button'" label="布局">
            <el-select v-model="form.layout" class="w-full" placeholder="选择布局">
              <el-option label="继承上级或使用默认布局" value="" />
              <el-option
                v-for="option in layoutOptions"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="排序"
            ><el-input-number v-model="form.sortOrder" :min="0" :max="9999" class="!w-full"
          /></el-form-item>
          <template v-if="form.type !== 'button'">
            <el-form-item label="站内路由" required>
              <el-input v-model.trim="form.path" :placeholder="routePlaceholder" />
              <small class="route-hint">{{ routeHint }}</small>
            </el-form-item>
          </template>
          <template v-if="form.type === 'menu'">
            <el-form-item label="页面组件" required
              ><el-select v-model="form.component" class="w-full" placeholder="选择已注册页面"
                ><el-option
                  v-for="option in viewComponentOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value" /></el-select
            ></el-form-item>
          </template>
          <el-form-item
            v-if="form.type === 'button'"
            label="外部链接"
            required
            class="sm:col-span-2"
            ><el-input v-model.trim="form.externalUrl" placeholder="https://example.com"
          /></el-form-item>
          <el-form-item label="节点状态" class="sm:col-span-2"
            ><el-switch v-model="form.enabled" active-text="启用" inactive-text="停用"
          /></el-form-item>
        </div>
        <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
        <div class="dialog-actions">
          <el-button @click="dialogOpen = false">取消</el-button
          ><el-button native-type="submit" type="primary" :loading="saving">保存节点</el-button>
        </div>
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
import { iconOptions } from '../../../shared/icons/icon-registry.js'
import { layoutOptions } from '../../../shared/routing/layout-registry.js'
import { useNavigationStore } from '../../navigation/navigation.store.js'
import { createInternalMenuCode, menuPathError } from '../menu-form.js'
import { buildMenuTree, type MenuTreeRecord } from '../menu-tree.js'
import { createMenu, deleteMenu, listAllMenus, updateMenu } from '../menus.api.js'

type MenuType = MenuSummary['type']
interface MenuForm {
  parentId: number
  name: string
  path: string
  component: string
  layout: string
  externalUrl: string
  icon: string
  sortOrder: number
  type: MenuType
  enabled: boolean
}

const records = ref<MenuSummary[]>([])
const total = ref(0)
const keyword = ref(''),
  loading = ref(false),
  saving = ref(false),
  dialogOpen = ref(false)
const editingId = ref<number | null>(null),
  errorMessage = ref(''),
  formError = ref('')
const internalCode = ref('')
const navigation = useNavigationStore()
const form = reactive<MenuForm>({
  parentId: 0,
  name: '',
  path: '',
  component: '',
  layout: '',
  externalUrl: '',
  icon: '',
  sortOrder: 0,
  type: 'menu',
  enabled: true,
})
const typeOptions = [
  { label: '目录', value: 'directory' },
  { label: '菜单', value: 'menu' },
  { label: '外链按钮', value: 'button' },
]
const treeRecords = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return buildMenuTree(records.value)
  const byId = new Map(records.value.map((record) => [record.id, record]))
  const visibleIds = new Set<number>()
  for (const record of records.value) {
    if (!record.name.toLowerCase().includes(query)) continue
    visibleIds.add(record.id)
    let parentId = record.parentId
    while (parentId > 0 && !visibleIds.has(parentId)) {
      visibleIds.add(parentId)
      parentId = byId.get(parentId)?.parentId ?? 0
    }
  }
  return buildMenuTree(records.value.filter((record) => visibleIds.has(record.id)))
})
const directoryOptions = computed(() =>
  records.value.filter((record) => record.type === 'directory'),
)
const routePlaceholder = computed(() =>
  form.parentId === 0 ? '例如 /system' : '例如 users 或 /users',
)
const routeHint = computed(() =>
  form.parentId === 0
    ? '根节点必须以 / 开头'
    : '相对路径会拼接上级目录；以 / 开头时使用绝对路径',
)

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    records.value = await listAllMenus()
    total.value = records.value.length
  } catch (error) {
    records.value = []
    total.value = 0
    errorMessage.value = error instanceof Error ? error.message : '菜单加载失败'
  } finally {
    loading.value = false
  }
}

function resetForm(parentId = 0): void {
  internalCode.value = createInternalMenuCode()
  Object.assign(form, {
    parentId,
    name: '',
    path: '',
    component: '',
    layout: '',
    externalUrl: '',
    icon: '',
    sortOrder: 0,
    type: 'menu',
    enabled: true,
  })
}
function openCreate(parentId: number): void {
  editingId.value = null
  resetForm(parentId)
  formError.value = ''
  dialogOpen.value = true
}
function openEdit(row: MenuTreeRecord): void {
  editingId.value = row.id
  internalCode.value = row.code
  Object.assign(form, {
    parentId: row.parentId,
    name: row.name,
    path: row.path,
    component: row.component,
    layout: row.layout,
    externalUrl: row.externalUrl,
    icon: row.icon,
    sortOrder: row.sortOrder,
    type: row.type,
    enabled: row.enabled,
  })
  formError.value = ''
  dialogOpen.value = true
}
function search(): void {
  /* keyword filtering is computed locally to preserve ancestors */
}

function payload(): MenuRequest {
  const common = {
    parentId: form.parentId,
    name: form.name,
    code: internalCode.value,
    icon: form.icon,
    sortOrder: form.sortOrder,
    enabled: form.enabled,
  }
  if (form.type === 'directory')
    return {
      ...common,
      type: 'directory',
      path: form.path,
      component: '',
      layout: form.layout,
      externalUrl: '',
    }
  if (form.type === 'button')
    return {
      ...common,
      type: 'button',
      path: '',
      component: '',
      layout: '',
      externalUrl: form.externalUrl,
    }
  return {
    ...common,
    type: 'menu',
    path: form.path,
    component: form.component,
    layout: form.layout,
    externalUrl: '',
  }
}

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (!form.name) throw new Error('请填写名称')
    const pathError = menuPathError(form.type, form.parentId, form.path)
    if (pathError) throw new Error(pathError)
    if (form.type === 'menu' && !form.component) throw new Error('菜单必须配置页面组件')
    if (form.type === 'button' && !/^https?:\/\//i.test(form.externalUrl))
      throw new Error('外链按钮必须配置 http 或 https 地址')
    const result = editingId.value
      ? await updateMenu(editingId.value, payload())
      : await createMenu(payload())
    if (result.status !== 0) throw new Error(result.err || '菜单保存失败')
    dialogOpen.value = false
    ElMessage.success('菜单节点已保存')
    await load()
    await navigation.load(true)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '菜单保存失败'
  } finally {
    saving.value = false
  }
}

async function remove(row: MenuTreeRecord): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除“${row.name}”吗？目录必须先清空子节点。`, '删除菜单节点', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const result = await deleteMenu(row.id)
    if (result.status !== 0) throw new Error('err' in result ? result.err : '删除失败')
    ElMessage.success('菜单节点已删除')
    await load()
    await navigation.load(true)
  } catch (error) {
    if (error !== 'cancel' && error !== 'close')
      errorMessage.value = error instanceof Error ? error.message : '删除失败'
  }
}

function typeLabel(type: MenuType): string {
  return ({ directory: '目录', menu: '菜单', button: '外链' } as const)[type]
}
function tagType(type: MenuType): 'success' | 'warning' | 'info' {
  return type === 'menu' ? 'success' : type === 'button' ? 'warning' : 'info'
}
function fallbackIcon(type: MenuType): string {
  return type === 'directory' ? 'layers' : type === 'button' ? 'external' : 'menu'
}
watch(
  () => form.type,
  function clearUnusedFields(type) {
    if (type === 'button') {
      form.path = ''
      form.component = ''
    }
    if (type === 'directory') form.component = ''
    if (type !== 'button') form.externalUrl = ''
    if (type === 'button') form.layout = ''
  },
)
onMounted(load)
</script>

<style lang="scss" scoped>
:deep(.el-table) {
  .el-table__row {
    .cell {
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
}

.menu-name {
  display: flex;
  align-items: center;
  gap: 11px;
}
.menu-name b {
  display: block;
  color: var(--ink);
  font-size: 13px;
}
.menu-icon {
  display: grid;
  width: 34px;
  height: 34px;
  place-items: center;
  border-radius: 11px;
  color: var(--primary-deep);
  background: var(--primary-mist);
}
.external-target {
  display: block;
  max-width: 280px;
  overflow: hidden;
  color: var(--primary-deep);
  font-size: 11px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.icon-option {
  display: flex;
  align-items: center;
  gap: 10px;
}
.icon-option .icon {
  width: 17px;
  height: 17px;
  color: var(--primary-deep);
}
.route-hint {
  display: block;
  margin-top: 7px;
  color: var(--muted);
  font-size: 11px;
  line-height: 1.5;
}
</style>
