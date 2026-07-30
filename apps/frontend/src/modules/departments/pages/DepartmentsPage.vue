<template>
  <section class="management-page" aria-labelledby="departments-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate(0)">
        新增部门
      </el-button>
    </header>
    <DepartmentsList
      ref="departmentsList"
      @create="openCreate"
      @edit="openEdit"
      @loaded="records = $event"
    />
    <DepartmentDialog
      v-model="dialogOpen"
      :department="editingDepartment"
      :parent-id="parentId"
      :records="records"
      @saved="refreshList"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { DepartmentSummary } from '@scaffold/api-contract'
import DepartmentDialog from './components/DepartmentDialog.vue'
import DepartmentsList from './components/DepartmentsList.vue'

const departmentsList = ref<InstanceType<typeof DepartmentsList> | null>(null)
const records = ref<DepartmentSummary[]>([])
const editingDepartment = ref<DepartmentSummary | null>(null)
const parentId = ref(0)
const dialogOpen = ref(false)

function openCreate(selectedParentId: number): void {
  editingDepartment.value = null
  parentId.value = selectedParentId
  dialogOpen.value = true
}

function openEdit(department: DepartmentSummary): void {
  editingDepartment.value = department
  parentId.value = department.parentId
  dialogOpen.value = true
}

async function refreshList(): Promise<void> {
  await departmentsList.value?.reload()
}
</script>
