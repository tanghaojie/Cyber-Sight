<template>
  <div class="surface-card">
    <div class="resource-toolbar">
      <el-input
        v-model="keyword"
        clearable
        :prefix-icon="Search"
        placeholder="搜索菜单名称"
        size="large"
      />
      <span
        >共 <strong>{{ records.length }}</strong> 个节点</span
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
            <span class="menu-icon">
              <AppIcon :name="row.icon || fallbackIcon(row.type)" />
            </span>
            <b>{{ row.name }}</b>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="类型" width="110">
        <template #default="{ row }">
          <el-tag :type="tagType(row.type)" effect="light" round>
            {{ typeLabel(row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="目标" min-width="230">
        <template #default="{ row }">
          <code v-if="row.type === 'menu'" class="code-chip">
            {{ row.path }} · {{ row.component }}
          </code>
          <a
            v-else-if="row.type === 'button'"
            class="external-target"
            :href="row.externalUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ row.externalUrl }} ↗
          </a>
          <code v-else class="code-chip">{{ row.path || '待配置站内路由' }}</code>
        </template>
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
          <el-button
            v-if="row.type === 'directory'"
            circle
            text
            type="primary"
            :icon="Plus"
            title="添加子节点"
            @click="emit('create', row.id)"
          />
          <el-button circle text :icon="EditPen" @click="emit('edit', row)" />
          <el-button circle text type="danger" :icon="Delete" @click="remove(row)" />
        </template>
      </el-table-column>
    </el-table>
    <footer class="resource-footer">
      <span class="table-muted">树形菜单一次加载全部节点，排序按目录层级生效</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { MenuSummary } from '@scaffold/api-contract'
import AppIcon from '@/components/AppIcon.vue'
import { useNavigationStore } from '@/modules/navigation/navigation.store.js'
import { buildMenuTree, type MenuTreeRecord } from '@/modules/menus/menu-tree.js'
import { deleteMenu, listAllMenus } from '@/modules/menus/menus.api.js'

type MenuType = MenuSummary['type']

const emit = defineEmits<{
  create: [parentId: number]
  edit: [menu: MenuSummary]
  loaded: [records: MenuSummary[]]
}>()

const records = ref<MenuSummary[]>([])
const keyword = ref('')
const loading = ref(false)
const errorMessage = ref('')
const navigation = useNavigationStore()
const treeRecords = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return buildMenuTree(records.value)
  const byId = new Map(records.value.map((record) => [record.id, record]))
  const visibleIds = new Set<number>()
  for (const record of records.value) {
    if (!record.name.toLowerCase().includes(query)) continue
    visibleIds.add(record.id)
    let currentParentId = record.parentId
    while (currentParentId > 0 && !visibleIds.has(currentParentId)) {
      visibleIds.add(currentParentId)
      currentParentId = byId.get(currentParentId)?.parentId ?? 0
    }
  }
  return buildMenuTree(records.value.filter((record) => visibleIds.has(record.id)))
})

async function load(): Promise<void> {
  loading.value = true
  errorMessage.value = ''
  try {
    records.value = await listAllMenus()
  } catch (error) {
    records.value = []
    errorMessage.value = error instanceof Error ? error.message : '菜单加载失败'
  } finally {
    loading.value = false
    emit('loaded', records.value)
  }
}

async function remove(menu: MenuTreeRecord): Promise<void> {
  try {
    await ElMessageBox.confirm(`确定删除“${menu.name}”吗？目录必须先清空子节点。`, '删除菜单节点', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    })
    const result = await deleteMenu(menu.id)
    if (result.status !== 0) throw new Error('err' in result ? result.err : '删除失败')
    ElMessage.success('菜单节点已删除')
    await load()
    await navigation.load(true)
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') {
      errorMessage.value = error instanceof Error ? error.message : '删除失败'
    }
  }
}

function typeLabel(type: MenuType): string {
  if (type === 'directory') return '目录'
  if (type === 'button') return '外链'
  return '菜单'
}

function tagType(type: MenuType): 'success' | 'warning' | 'info' {
  return type === 'menu' ? 'success' : type === 'button' ? 'warning' : 'info'
}

function fallbackIcon(type: MenuType): string {
  return type === 'directory' ? 'layers' : type === 'button' ? 'external' : 'menu'
}

defineExpose({ reload: load })
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
</style>
