<template>
  <el-dialog
    v-model="dialogOpen"
    :title="role ? '编辑角色' : '新增角色'"
    width="min(660px, calc(100vw - 32px))"
    :close-on-click-modal="!saving"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <div class="form-columns">
        <el-form-item label="角色名称" required>
          <el-input v-model.trim="form.name" placeholder="例如 内容运营" />
        </el-form-item>
        <el-form-item label="角色编码" required>
          <el-input v-model.trim="form.code" placeholder="例如 CONTENT_OPERATOR" />
        </el-form-item>
        <el-form-item label="职责说明" class="sm:col-span-2">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            placeholder="说明该角色的责任范围"
          />
        </el-form-item>
        <el-form-item label="菜单权限" class="sm:col-span-2">
          <el-tree-select
            v-model="form.menuIds"
            class="w-full"
            :data="menuTree"
            multiple
            show-checkbox
            check-strictly
            node-key="value"
            :render-after-expand="false"
            placeholder="选择目录、菜单或外链按钮"
          />
        </el-form-item>
        <el-form-item label="角色状态" class="sm:col-span-2">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </div>
      <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
      <div class="dialog-actions">
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button native-type="submit" type="primary" :loading="saving">保存角色</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { RoleRequest, RoleSummary } from '@scaffold/api-contract'
import { listMenuTreeOptions, type MenuTreeOption } from '@/modules/menus/menu-options'
import { createRole, updateRole } from '@/modules/roles/roles.api'

const props = defineProps<{
  role: RoleSummary | null
}>()
const emit = defineEmits<{
  saved: []
}>()
const dialogOpen = defineModel<boolean>({ required: true })

const menuTree = ref<MenuTreeOption[]>([])
const saving = ref(false)
const formError = ref('')
const form = reactive<RoleRequest>({
  name: '',
  code: '',
  description: '',
  enabled: true,
  menuIds: [],
})

function resetForm(): void {
  Object.assign(
    form,
    props.role
      ? {
          name: props.role.name,
          code: props.role.code,
          description: props.role.description,
          enabled: props.role.enabled,
          menuIds: [...props.role.menuIds],
        }
      : { name: '', code: '', description: '', enabled: true, menuIds: [] },
  )
  formError.value = ''
}

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (!form.name || !/^[A-Z0-9_]{2,50}$/.test(form.code)) {
      throw new Error('请填写角色名称，角色编码仅使用大写字母、数字和下划线')
    }
    const payload: RoleRequest = { ...form, menuIds: [...form.menuIds] }
    const result = props.role ? await updateRole(props.role.id, payload) : await createRole(payload)
    if (result.status !== 0) {
      throw new Error(result.err || '角色保存失败')
    }
    dialogOpen.value = false
    ElMessage.success('角色已保存')
    emit('saved')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '角色保存失败'
  } finally {
    saving.value = false
  }
}

watch(dialogOpen, function initializeForm(open) {
  if (open) {
    resetForm()
  }
})

onMounted(async function loadMenuOptions() {
  try {
    menuTree.value = await listMenuTreeOptions()
  } catch {
    menuTree.value = []
  }
})
</script>
