<template>
  <section class="management-page" aria-labelledby="dictionaries-title">
    <header class="page-intro">
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate">
        新增字典项
      </el-button>
    </header>

    <DictionariesList ref="dictionariesList" @edit="openEdit" />
    <DictionaryDialog v-model="dialogOpen" :dictionary="editingDictionary" @saved="refreshList" />
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import type { DictionarySummary } from '@scaffold/api-contract'
import DictionariesList from './components/DictionariesList.vue'
import DictionaryDialog from './components/DictionaryDialog.vue'

const dictionariesList = ref<InstanceType<typeof DictionariesList> | null>(null)
const editingDictionary = ref<DictionarySummary | null>(null)
const dialogOpen = ref(false)

function openCreate(): void {
  editingDictionary.value = null
  dialogOpen.value = true
}

function openEdit(dictionary: DictionarySummary): void {
  editingDictionary.value = dictionary
  dialogOpen.value = true
}

async function refreshList(): Promise<void> {
  await dictionariesList.value?.reload()
}
</script>
