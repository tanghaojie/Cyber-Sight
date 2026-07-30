<template>
  <section class="management-page" aria-labelledby="users-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate"> 新增用户 </el-button>
    </header>

    <!-- 页面负责协调选项、列表和弹窗；分页与表单细节留在子组件内部。 -->
    <UsersList
      ref="usersList"
      :role-options="roleOptions"
      :department-options="departmentOptions"
      @edit="openEdit"
    />
    <UserDialog
      v-model="dialogOpen"
      :user="editingUser"
      :role-options="roleOptions"
      :department-options="departmentOptions"
      @saved="refreshList"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { DepartmentOption, UserSummary } from '@scaffold/api-contract'
import { listDepartmentOptions } from '@/modules/departments/departments.api'
import { listRoleOptions, type RoleOption } from '@/modules/roles/roles.api'
import UserDialog from './components/UserDialog.vue'
import UsersList from './components/UsersList.vue'

const usersList = ref<InstanceType<typeof UsersList> | null>(null)
const roleOptions = ref<RoleOption[]>([])
const departmentOptions = ref<DepartmentOption[]>([])
const editingUser = ref<UserSummary | null>(null)
const dialogOpen = ref(false)

function openCreate(): void {
  editingUser.value = null
  dialogOpen.value = true
}

function openEdit(user: UserSummary): void {
  editingUser.value = user
  dialogOpen.value = true
}

async function refreshList(): Promise<void> {
  await usersList.value?.reload()
}

onMounted(async function loadOptions() {
  // 两组选项互不依赖，并行加载且允许其中一组失败后页面仍可展示用户列表。
  const [roles, departments] = await Promise.allSettled([
    listRoleOptions(),
    listDepartmentOptions(),
  ])
  roleOptions.value = roles.status === 'fulfilled' ? roles.value : []
  departmentOptions.value = departments.status === 'fulfilled' ? departments.value : []
})
</script>
