<template>
  <section class="management-page" aria-labelledby="users-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate"> 新增用户 </el-button>
    </header>

    <UsersList ref="usersList" :role-options="roleOptions" @edit="openEdit" />
    <UserDialog
      v-model="dialogOpen"
      :user="editingUser"
      :role-options="roleOptions"
      @saved="refreshList"
    />
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { UserSummary } from '@scaffold/api-contract'
import { listRoleOptions, type RoleOption } from '@/modules/roles/roles.api'
import UserDialog from './components/UserDialog.vue'
import UsersList from './components/UsersList.vue'

const usersList = ref<InstanceType<typeof UsersList> | null>(null)
const roleOptions = ref<RoleOption[]>([])
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

onMounted(async function loadRoles() {
  try {
    roleOptions.value = await listRoleOptions()
  } catch {
    roleOptions.value = []
  }
})
</script>
