<template>
  <el-dialog
    v-model="dialogOpen"
    :title="menu ? '编辑菜单节点' : '新增菜单节点'"
    width="min(720px, calc(100vw - 32px))"
    :close-on-click-modal="!saving"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <div class="form-columns">
        <el-form-item label="名称" required>
          <el-input v-model.trim="form.name" placeholder="例如 报表中心" />
        </el-form-item>
        <el-form-item label="上级目录">
          <el-select v-model="form.parentId" class="w-full">
            <el-option label="根节点" :value="0" />
            <el-option
              v-for="directory in directoryOptions"
              :key="directory.id"
              :label="directory.name"
              :value="directory.id"
              :disabled="directory.id === menu?.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="节点类型" required>
          <el-segmented v-model="form.type" :options="typeOptions" class="w-full" />
        </el-form-item>
        <el-form-item label="图标">
          <el-select v-model="form.icon" class="w-full" clearable filterable placeholder="选择图标">
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
        <!-- 节点类型决定互斥字段：站内节点使用路由/布局，外链只使用 URL。 -->
        <el-form-item v-if="form.type !== 'button'" label="布局">
          <el-select v-model="form.layout" class="w-full" placeholder="选择布局">
            <el-option label="继承上级或使用默认布局" value="" />
            <el-option
              v-for="(data, key) in layoutRegistry"
              :key="key"
              :label="data.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" class="!w-full" />
        </el-form-item>
        <el-form-item label="访问权限">
          <el-select
            v-model="form.requiredPermissionKey"
            class="w-full"
            clearable
            placeholder="不限制（公共菜单）"
          >
            <el-option
              v-for="permission in permissions"
              :key="permission.key"
              :label="`${permission.name} · ${permission.key}`"
              :value="permission.key"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type !== 'button'" label="站内路由" required>
          <el-input v-model.trim="form.path" :placeholder="routePlaceholder" />
          <small class="route-hint">{{ routeHint }}</small>
        </el-form-item>
        <el-form-item v-if="form.type === 'menu'" label="页面组件" required>
          <el-select v-model="form.component" class="w-full" placeholder="选择已注册页面">
            <el-option
              v-for="(data, key) of viewRegistry"
              :key="key"
              :label="data.label"
              :value="key"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="form.type === 'button'" label="外部链接" required class="sm:col-span-2">
          <el-input v-model.trim="form.externalUrl" placeholder="https://example.com" />
        </el-form-item>
        <el-form-item label="节点状态" class="sm:col-span-2">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </div>
      <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
      <div class="dialog-actions">
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button native-type="submit" type="primary" :loading="saving">保存节点</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { MenuRequest, MenuSummary, PermissionSummary } from '@scaffold/api-contract'
import { listAuthorizationPermissions } from '@/modules/authorization/authorization.api'
import AppIcon from '@/components/AppIcon.vue'
import { menuPathError } from '@/modules/menus/menu-form'
import { createMenu, updateMenu } from '@/modules/menus/menus.api'
import { useNavigationStore } from '@/modules/navigation/navigation.store'
import { viewRegistry } from '@/shared/routing/view-registry'
import { iconOptions } from '@/shared/icons/icon-registry'
import { layoutRegistry } from '@/shared/routing/layout-registry'

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
  requiredPermissionKey: string | null
}

const props = defineProps<{
  menu: MenuSummary | null
  parentId: number
  records: MenuSummary[]
}>()
const emit = defineEmits<{
  saved: []
}>()
const dialogOpen = defineModel<boolean>({ required: true })

const saving = ref(false)
const formError = ref('')
const navigation = useNavigationStore()
const permissions = ref<PermissionSummary[]>([])
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
  requiredPermissionKey: null,
})
const typeOptions = [
  { label: '目录', value: 'directory' },
  { label: '菜单', value: 'menu' },
  { label: '外链按钮', value: 'button' },
]
// 只有目录能成为父节点；当前节点先在前端禁用，后端再负责完整的环检测。
const directoryOptions = computed(() =>
  props.records.filter((record) => record.type === 'directory'),
)
const routePlaceholder = computed(() =>
  form.parentId === 0 ? '例如 /system' : '例如 users 或 /users',
)
const routeHint = computed(() =>
  form.parentId === 0 ? '根节点必须以 / 开头' : '相对路径会拼接上级目录；以 / 开头时使用绝对路径',
)

function resetForm(): void {
  // 每次打开从传入菜单重建表单，避免类型切换留下上一次编辑的字段。
  if (props.menu) {
    Object.assign(form, {
      parentId: props.menu.parentId,
      name: props.menu.name,
      path: props.menu.path,
      component: props.menu.component,
      layout: props.menu.layout,
      externalUrl: props.menu.externalUrl,
      icon: props.menu.icon,
      sortOrder: props.menu.sortOrder,
      type: props.menu.type,
      enabled: props.menu.enabled,
      requiredPermissionKey: props.menu.requiredPermissionKey ?? null,
    })
  } else {
    Object.assign(form, {
      parentId: props.parentId,
      name: '',
      path: '',
      component: '',
      layout: '',
      externalUrl: '',
      icon: '',
      sortOrder: 0,
      type: 'menu',
      enabled: true,
      requiredPermissionKey: null,
    })
  }
  formError.value = ''
}

function payload(): MenuRequest {
  // 按 discriminated union 只发送当前类型允许的字段，并显式清空互斥字段。
  const common = {
    parentId: form.parentId,
    name: form.name,
    icon: form.icon,
    sortOrder: form.sortOrder,
    enabled: form.enabled,
    requiredPermissionKey: form.requiredPermissionKey,
  }
  if (form.type === 'directory') {
    return {
      ...common,
      type: 'directory',
      path: form.path,
      component: '',
      layout: form.layout,
      externalUrl: '',
    }
  }
  if (form.type === 'button') {
    return {
      ...common,
      type: 'button',
      path: '',
      component: '',
      layout: '',
      externalUrl: form.externalUrl,
    }
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
    if (!form.name) {
      throw new Error('请填写名称')
    }
    const pathError = menuPathError(form.type, form.parentId, form.path)
    if (pathError) {
      throw new Error(pathError)
    }
    if (form.type === 'menu' && !form.component) {
      throw new Error('菜单必须配置页面组件')
    }
    if (form.type === 'button' && !/^https?:\/\//i.test(form.externalUrl)) {
      throw new Error('外链按钮必须配置 http 或 https 地址')
    }
    const result = props.menu
      ? await updateMenu(props.menu.id, payload())
      : await createMenu(payload())
    if (result.status !== 0) {
      throw new Error(result.err || '菜单保存失败')
    }
    dialogOpen.value = false
    ElMessage.success('菜单节点已保存')
    emit('saved')
    // 刷新导航 Store，使新路径、权限键或启用状态立即反映到侧栏和动态路由。
    await navigation.load(true)
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '菜单保存失败'
  } finally {
    saving.value = false
  }
}

watch(dialogOpen, function initializeForm(open) {
  if (open) {
    resetForm()
  }
})

watch(
  () => form.type,
  function clearUnusedFields(type) {
    // 类型切换时同步清理不可见字段，避免旧值被 payload() 意外带回。
    if (type === 'button') {
      form.path = ''
      form.component = ''
    }
    if (type === 'directory') {
      form.component = ''
    }
    if (type !== 'button') {
      form.externalUrl = ''
    }
    if (type === 'button') {
      form.layout = ''
    }
  },
)

onMounted(async function loadPermissionOptions() {
  try {
    // 菜单权限选择只允许引用后端当前登记且启用的权限键。
    permissions.value = await listAuthorizationPermissions()
  } catch {
    permissions.value = []
  }
})
</script>

<style lang="scss" scoped>
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
