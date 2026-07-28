<template>
  <section class="management-page" aria-labelledby="menus-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate(0)"> 新增 </el-button>
    </header>

    <MenusList ref="menusList" @create="openCreate" @edit="openEdit" @loaded="records = $event" />
    <MenuDialog
      v-model="dialogOpen"
      :menu="editingMenu"
      :parent-id="parentId"
      :records="records"
      @saved="refreshList"
    />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { MenuSummary } from '@scaffold/api-contract'
import MenuDialog from './components/MenuDialog.vue'
import MenusList from './components/MenusList.vue'

const menusList = ref<InstanceType<typeof MenusList> | null>(null)
const records = ref<MenuSummary[]>([])
const editingMenu = ref<MenuSummary | null>(null)
const parentId = ref(0)
const dialogOpen = ref(false)

function openCreate(selectedParentId: number): void {
  editingMenu.value = null
  parentId.value = selectedParentId
  dialogOpen.value = true
}

function openEdit(menu: MenuSummary): void {
  editingMenu.value = menu
  parentId.value = menu.parentId
  dialogOpen.value = true
}

async function refreshList(): Promise<void> {
  await menusList.value?.reload()
}
</script>
