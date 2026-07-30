<template>
  <section class="management-page" aria-labelledby="users-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate"> 新增用户 </el-button>
    </header>

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
  const [roles, departments] = await Promise.allSettled([
    listRoleOptions(),
    listDepartmentOptions(),
  ])
  roleOptions.value = roles.status === 'fulfilled' ? roles.value : []
  departmentOptions.value = departments.status === 'fulfilled' ? departments.value : []
})
</script>
