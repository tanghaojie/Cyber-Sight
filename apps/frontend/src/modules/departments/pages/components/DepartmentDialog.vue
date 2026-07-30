<template>
  <el-dialog
    v-model="dialogOpen"
    :title="department ? '编辑部门' : '新增部门'"
    width="min(920px, calc(100vw - 32px))"
    :close-on-click-modal="!saving"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <div class="form-columns">
        <el-form-item label="部门名称" required>
          <el-input v-model.trim="form.name" placeholder="例如 华东销售部" />
        </el-form-item>
        <el-form-item label="部门编码" required>
          <el-input v-model.trim="form.code" placeholder="例如 EAST_SALES" />
        </el-form-item>
        <el-form-item label="上级部门">
          <el-tree-select
            v-model="form.parentId"
            class="w-full"
            :data="parentTreeOptions"
            node-key="value"
            check-strictly
            default-expand-all
            filterable
          />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" class="!w-full" />
        </el-form-item>
        <el-form-item label="部门状态" class="sm:col-span-2">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </div>
      <!-- 部门策略允许向下级继承，基本资料保存成功后再整体替换策略。 -->
      <DataPolicyEditor v-model="access.dataPolicies" allow-inheritance />
      <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
      <div class="dialog-actions">
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button native-type="submit" type="primary" :loading="saving" :disabled="!accessReady">
          保存部门
        </el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type {
  DepartmentRequest,
  DepartmentSummary,
  SubjectAccessRequest,
} from '@scaffold/api-contract'
import DataPolicyEditor from '@/modules/authorization/components/DataPolicyEditor.vue'
import { getSubjectAccess, replaceSubjectAccess } from '@/modules/authorization/authorization.api'
import { createDepartment, updateDepartment } from '@/modules/departments/departments.api'
import {
  buildDepartmentTree,
  collectDepartmentSubtreeIds,
  toDepartmentTreeOptions,
  type DepartmentTreeOption,
} from '../department-tree'

const props = defineProps<{
  department: DepartmentSummary | null
  parentId: number
  records: DepartmentSummary[]
}>()
const emit = defineEmits<{ saved: [] }>()
const dialogOpen = defineModel<boolean>({ required: true })
const saving = ref(false)
const accessReady = ref(true)
const formError = ref('')
const form = reactive<DepartmentRequest>({
  parentId: 0,
  code: '',
  name: '',
  sortOrder: 0,
  enabled: true,
})
const access = reactive<SubjectAccessRequest>({ permissionKeys: [], dataPolicies: [] })
const parentTreeOptions = computed<DepartmentTreeOption[]>(() => {
  const excludedIds = props.department
    ? collectDepartmentSubtreeIds(props.records, props.department.id)
    : new Set<number>()
  const children = toDepartmentTreeOptions(buildDepartmentTree(props.records, excludedIds))
  return [{ value: 0, label: '根部门', ...(children.length > 0 ? { children } : {}) }]
})

function resetForm(): void {
  Object.assign(
    form,
    props.department
      ? {
          parentId: props.department.parentId,
          code: props.department.code,
          name: props.department.name,
          sortOrder: props.department.sortOrder,
          enabled: props.department.enabled,
        }
      : { parentId: props.parentId, code: '', name: '', sortOrder: 0, enabled: true },
  )
  Object.assign(access, { permissionKeys: [], dataPolicies: [] })
  formError.value = ''
}

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (!form.name || !/^[A-Z0-9_]{2,50}$/.test(form.code)) {
      throw new Error('请填写部门名称，部门编码仅使用大写字母、数字和下划线')
    }
    const result = props.department
      ? await updateDepartment(props.department.id, { ...form })
      : await createDepartment({ ...form })
    if (result.status !== 0) {
      throw new Error(result.err || '部门保存失败')
    }
    const departmentId = props.department?.id ?? result.data?.id
    if (!departmentId) {
      throw new Error('部门已保存，但未返回部门标识，数据权限尚未保存')
    }
    // 新建部门取得主体 ID 后，才能保存以该部门为授权主体的数据规则。
    const accessResult = await replaceSubjectAccess('department', departmentId, {
      permissionKeys: [],
      dataPolicies: access.dataPolicies.map((policy) => ({
        ...policy,
        departmentIds: [...policy.departmentIds],
      })),
    })
    if (accessResult.status !== 0) {
      throw new Error(accessResult.err || '部门已保存，但数据权限保存失败')
    }
    dialogOpen.value = false
    ElMessage.success('部门已保存')
    emit('saved')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '部门保存失败'
  } finally {
    saving.value = false
  }
}

watch(dialogOpen, async function initializeForm(open) {
  if (!open) {
    return
  }
  resetForm()
  if (props.department) {
    // 策略加载完成前禁止提交，避免空配置覆盖已有部门继承规则。
    accessReady.value = false
    try {
      const loaded = await getSubjectAccess('department', props.department.id)
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
})
</script>
