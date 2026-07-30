<template>
  <el-dialog
    v-model="dialogOpen"
    :title="user ? '编辑用户' : '新增用户'"
    width="min(920px, calc(100vw - 32px))"
    :close-on-click-modal="!saving"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <div class="form-columns">
        <el-form-item label="用户名" required>
          <el-input
            v-model.trim="form.username"
            :disabled="Boolean(user)"
            placeholder="例如 zhangsan"
          />
        </el-form-item>
        <el-form-item label="姓名" required>
          <el-input v-model.trim="form.displayName" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="邮箱" required>
          <el-input v-model.trim="form.email" type="email" placeholder="name@example.com" />
        </el-form-item>
        <el-form-item :label="user ? '新密码（可选）' : '密码'" :required="!user">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            placeholder="至少 8 个字符"
          />
        </el-form-item>
        <el-form-item label="角色" class="sm:col-span-2">
          <el-select v-model="form.roleIds" multiple class="w-full" placeholder="选择角色">
            <el-option
              v-for="role in roleOptions"
              :key="role.id"
              :label="role.name"
              :value="role.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="所属部门" class="sm:col-span-2" required>
          <el-select
            v-model="form.departmentIds"
            multiple
            filterable
            class="w-full"
            placeholder="至少选择一个部门"
          >
            <el-option
              v-for="department in departmentOptions"
              :key="department.id"
              :label="department.name"
              :value="department.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="主部门" class="sm:col-span-2" required>
          <el-select v-model="form.primaryDepartmentId" class="w-full" placeholder="选择主部门">
            <el-option
              v-for="department in selectedDepartments"
              :key="department.id"
              :label="department.name"
              :value="department.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="账号状态" class="sm:col-span-2">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </div>
      <DataPolicyEditor v-model="access.dataPolicies" />
      <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
      <div class="dialog-actions">
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button native-type="submit" type="primary" :loading="saving" :disabled="!accessReady">
          保存用户
        </el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type {
  DepartmentOption,
  SubjectAccessRequest,
  UserCreate,
  UserSummary,
  UserUpdate,
} from '@scaffold/api-contract'
import DataPolicyEditor from '@/modules/authorization/components/DataPolicyEditor.vue'
import { getSubjectAccess, replaceSubjectAccess } from '@/modules/authorization/authorization.api'
import type { RoleOption } from '@/modules/roles/roles.api'
import { createUser, updateUser } from '@/modules/users/users.api'

const props = defineProps<{
  user: UserSummary | null
  roleOptions: RoleOption[]
  departmentOptions: DepartmentOption[]
}>()
const emit = defineEmits<{
  saved: []
}>()
const dialogOpen = defineModel<boolean>({ required: true })

const saving = ref(false)
const accessReady = ref(true)
const formError = ref('')
const form = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  roleIds: [] as number[],
  departmentIds: [] as number[],
  primaryDepartmentId: 0,
  enabled: true,
})
const access = reactive<SubjectAccessRequest>({ permissionKeys: [], dataPolicies: [] })
const selectedDepartments = computed(() =>
  props.departmentOptions.filter((department) => form.departmentIds.includes(department.id)),
)

function resetForm(): void {
  Object.assign(
    form,
    props.user
      ? {
          username: props.user.username,
          displayName: props.user.displayName,
          email: props.user.email,
          password: '',
          roleIds: [...props.user.roleIds],
          departmentIds: [...props.user.departmentIds],
          primaryDepartmentId: props.user.primaryDepartmentId,
          enabled: props.user.enabled,
        }
      : {
          username: '',
          displayName: '',
          email: '',
          password: '',
          roleIds: [],
          departmentIds: props.departmentOptions[0] ? [props.departmentOptions[0].id] : [],
          primaryDepartmentId: props.departmentOptions[0]?.id ?? 0,
          enabled: true,
        },
  )
  Object.assign(access, { permissionKeys: [], dataPolicies: [] })
  formError.value = ''
}

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (
      !form.displayName ||
      !form.email ||
      (!props.user && (!form.username || form.password.length < 8))
    ) {
      throw new Error('请完整填写必填项，密码至少 8 个字符')
    }
    if (form.departmentIds.length === 0 || !form.departmentIds.includes(form.primaryDepartmentId)) {
      throw new Error('请至少选择一个所属部门，并从中指定主部门')
    }
    const result = props.user
      ? await updateUser(props.user.id, {
          displayName: form.displayName,
          email: form.email,
          ...(form.password ? { password: form.password } : {}),
          roleIds: form.roleIds,
          departmentIds: form.departmentIds,
          primaryDepartmentId: form.primaryDepartmentId,
          enabled: form.enabled,
        } satisfies UserUpdate)
      : await createUser({
          username: form.username,
          displayName: form.displayName,
          email: form.email,
          password: form.password,
          roleIds: form.roleIds,
          departmentIds: form.departmentIds,
          primaryDepartmentId: form.primaryDepartmentId,
          enabled: form.enabled,
        } satisfies UserCreate)
    if (result.status !== 0) {
      throw new Error(result.err || '用户保存失败')
    }
    const userId = props.user?.id ?? result.data?.id
    if (!userId) {
      throw new Error('用户已保存，但未返回用户标识，数据权限尚未保存')
    }
    const accessResult = await replaceSubjectAccess('user', userId, {
      permissionKeys: [],
      dataPolicies: access.dataPolicies.map((policy) => ({
        ...policy,
        departmentIds: [...policy.departmentIds],
      })),
    })
    if (accessResult.status !== 0) {
      throw new Error(accessResult.err || '用户已保存，但直接数据权限保存失败')
    }
    dialogOpen.value = false
    ElMessage.success('用户已保存')
    emit('saved')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '用户保存失败'
  } finally {
    saving.value = false
  }
}

watch(dialogOpen, async function initializeForm(open) {
  if (open) {
    resetForm()
    if (props.user) {
      accessReady.value = false
      try {
        const loaded = await getSubjectAccess('user', props.user.id)
        access.dataPolicies = loaded.dataPolicies.map((policy) => ({
          ...policy,
          departmentIds: [...policy.departmentIds],
        }))
      } catch (error) {
        formError.value = error instanceof Error ? error.message : '数据权限加载失败'
      } finally {
        accessReady.value = !formError.value
      }
    } else {
      accessReady.value = true
    }
  }
})

watch(
  () => form.departmentIds,
  function keepPrimaryDepartmentValid(departmentIds) {
    if (!departmentIds.includes(form.primaryDepartmentId)) {
      form.primaryDepartmentId = departmentIds[0] ?? 0
    }
  },
  { deep: true },
)
</script>
