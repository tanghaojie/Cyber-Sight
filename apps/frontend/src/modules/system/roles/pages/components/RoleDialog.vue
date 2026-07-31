<template>
  <el-dialog
    v-model="dialogOpen"
    :title="role ? t('roles.dialog.editTitle') : t('roles.dialog.createTitle')"
    width="min(920px, calc(100vw - 32px))"
    :close-on-click-modal="!saving"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <div class="form-columns">
        <el-form-item :label="t('roles.fields.name')" required>
          <el-input v-model.trim="form.name" :placeholder="t('roles.dialog.namePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('roles.fields.code')" required>
          <el-input v-model.trim="form.code" :placeholder="t('roles.dialog.codePlaceholder')" />
        </el-form-item>
        <el-form-item :label="t('roles.fields.description')" class="sm:col-span-2">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="3"
            :placeholder="t('roles.dialog.descriptionPlaceholder')"
          />
        </el-form-item>
        <el-form-item :label="t('roles.fields.permissions')" class="sm:col-span-2">
          <el-checkbox-group v-model="access.permissionKeys" class="permission-grid">
            <el-checkbox
              v-for="permission in permissions"
              :key="permission.key"
              :value="permission.key"
              border
            >
              <span>{{ permissionLabel(permission) }}</span>
              <small>{{ permission.key }}</small>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item :label="t('roles.fields.status')" class="sm:col-span-2">
          <el-switch
            v-model="form.enabled"
            :active-text="t('shared.state.enabled')"
            :inactive-text="t('shared.state.disabled')"
          />
        </el-form-item>
      </div>
      <!-- 角色基本资料、功能权限和数据策略在一次用户操作中分两步写入后端。 -->
      <DataPolicyEditor v-model="access.dataPolicies" />
      <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
      <div class="dialog-actions">
        <el-button @click="dialogOpen = false">{{ t('shared.actions.cancel') }}</el-button>
        <el-button native-type="submit" type="primary" :loading="saving" :disabled="!accessReady">
          {{ t('roles.dialog.save') }}
        </el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type {
  PermissionSummary,
  RoleRequest,
  RoleSummary,
  SubjectAccessRequest,
} from '@scaffold/api-contract'
import DataPolicyEditor from '@/modules/system/authorization/components/DataPolicyEditor.vue'
import {
  getSubjectAccess,
  listAuthorizationPermissions,
  replaceSubjectAccess,
} from '@/modules/system/authorization/authorization.api'
import { createRole, updateRole } from '@/modules/system/roles/roles.api'
import { useLocalization } from '@/modules/system/localization/localization'

const props = defineProps<{
  role: RoleSummary | null
}>()
const emit = defineEmits<{
  saved: []
}>()
const dialogOpen = defineModel<boolean>({ required: true })

const permissions = ref<PermissionSummary[]>([])
const saving = ref(false)
const accessReady = ref(true)
const formError = ref('')
const { resolveLocalizedLabel, t } = useLocalization()
const form = reactive<RoleRequest>({
  name: '',
  code: '',
  description: '',
  enabled: true,
})
const access = reactive<SubjectAccessRequest>({ permissionKeys: [], dataPolicies: [] })

function permissionLabel(permission: PermissionSummary): string {
  return resolveLocalizedLabel({
    key: `authorization.permissions.${permission.key}`,
    fallback: permission.name,
  })
}

function resetForm(): void {
  // 复制权限数组和策略对象，避免弹窗编辑过程污染列表或上次打开的状态。
  Object.assign(
    form,
    props.role
      ? {
          name: props.role.name,
          code: props.role.code,
          description: props.role.description,
          enabled: props.role.enabled,
        }
      : { name: '', code: '', description: '', enabled: true },
  )
  Object.assign(access, { permissionKeys: [], dataPolicies: [] })
  formError.value = ''
}

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (!form.name || !/^[A-Z0-9_]{2,50}$/.test(form.code)) {
      throw new Error(t('roles.errors.invalidForm'))
    }
    const payload: RoleRequest = { ...form }
    const result = props.role ? await updateRole(props.role.id, payload) : await createRole(payload)
    if (result.status !== 0) {
      throw new Error(t('roles.errors.saveFailed'))
    }
    const roleId = props.role?.id ?? result.data?.id
    if (!roleId) {
      throw new Error(t('roles.errors.missingId'))
    }
    // 新建角色取得主体 ID 后，才能整体替换该角色的功能权限和数据策略。
    const accessResult = await replaceSubjectAccess('role', roleId, {
      permissionKeys: [...access.permissionKeys],
      dataPolicies: access.dataPolicies.map((policy) => ({
        ...policy,
        departmentIds: [...policy.departmentIds],
      })),
    })
    if (accessResult.status !== 0) {
      throw new Error(t('roles.errors.accessSaveFailed'))
    }
    dialogOpen.value = false
    ElMessage.success(t('roles.messages.saved'))
    emit('saved')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : t('roles.errors.saveFailed')
  } finally {
    saving.value = false
  }
}

watch(dialogOpen, async function initializeForm(open) {
  if (open) {
    resetForm()
    if (props.role) {
      // 加载完成前禁止保存，防止空权限覆盖服务端已有配置。
      accessReady.value = false
      try {
        const loaded = await getSubjectAccess('role', props.role.id)
        access.permissionKeys = [...loaded.permissionKeys]
        access.dataPolicies = loaded.dataPolicies.map((policy) => ({
          ...policy,
          departmentIds: [...policy.departmentIds],
        }))
      } catch (error) {
        formError.value =
          error instanceof Error ? error.message : t('roles.errors.accessLoadFailed')
      } finally {
        accessReady.value = !formError.value
      }
    } else {
      accessReady.value = true
    }
  }
})

onMounted(async function loadPermissionOptions() {
  try {
    // 权限目录是只读元数据；加载失败时保留空列表，错误会在保存或后续重试中体现。
    permissions.value = await listAuthorizationPermissions()
  } catch {
    permissions.value = []
  }
})
</script>

<style scoped lang="scss">
.permission-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

.permission-grid .el-checkbox {
  width: 100%;
  height: auto;
  margin: 0;
  padding: 10px 12px;
}

.permission-grid span,
.permission-grid small {
  display: block;
}

.permission-grid small {
  margin-top: 3px;
  color: var(--muted);
  font-family: monospace;
}
</style>
