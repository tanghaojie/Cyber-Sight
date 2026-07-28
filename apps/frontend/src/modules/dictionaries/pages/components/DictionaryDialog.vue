<template>
  <el-dialog
    v-model="dialogOpen"
    :title="dictionary ? '编辑字典项' : '新增字典项'"
    width="min(640px, calc(100vw - 32px))"
    :close-on-click-modal="!saving"
  >
    <el-form label-position="top" @submit.prevent="submit">
      <div class="form-columns">
        <el-form-item label="字典类型" required>
          <el-input v-model.trim="form.type" placeholder="例如 ORDER_STATUS" />
        </el-form-item>
        <el-form-item label="显示名称" required>
          <el-input v-model.trim="form.label" placeholder="例如 已支付" />
        </el-form-item>
        <el-form-item label="字典值" required>
          <el-input v-model.trim="form.value" placeholder="例如 PAID" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sortOrder" :min="0" :max="9999" class="!w-full" />
        </el-form-item>
        <el-form-item label="备注" class="sm:col-span-2">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="可选说明" />
        </el-form-item>
        <el-form-item label="字典状态" class="sm:col-span-2">
          <el-switch v-model="form.enabled" active-text="启用" inactive-text="停用" />
        </el-form-item>
      </div>
      <el-alert v-if="formError" :title="formError" type="error" show-icon :closable="false" />
      <div class="dialog-actions">
        <el-button @click="dialogOpen = false">取消</el-button>
        <el-button native-type="submit" type="primary" :loading="saving">保存字典项</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { DictionaryRequest, DictionarySummary } from '@scaffold/api-contract'
import { createDictionary, updateDictionary } from '@/modules/dictionaries/dictionaries.api.js'

const props = defineProps<{
  dictionary: DictionarySummary | null
}>()
const emit = defineEmits<{
  saved: []
}>()
const dialogOpen = defineModel<boolean>({ required: true })

const saving = ref(false)
const formError = ref('')
const form = reactive<DictionaryRequest>({
  type: '',
  label: '',
  value: '',
  sortOrder: 0,
  enabled: true,
  remark: '',
})

function resetForm(): void {
  Object.assign(
    form,
    props.dictionary
      ? {
          type: props.dictionary.type,
          label: props.dictionary.label,
          value: props.dictionary.value,
          sortOrder: props.dictionary.sortOrder,
          enabled: props.dictionary.enabled,
          remark: props.dictionary.remark,
        }
      : { type: '', label: '', value: '', sortOrder: 0, enabled: true, remark: '' },
  )
  formError.value = ''
}

async function submit(): Promise<void> {
  saving.value = true
  formError.value = ''
  try {
    if (!form.type || !form.label || !form.value) {
      throw new Error('请完整填写字典类型、显示名称和字典值')
    }
    const payload: DictionaryRequest = { ...form }
    const result = props.dictionary
      ? await updateDictionary(props.dictionary.id, payload)
      : await createDictionary(payload)
    if (result.status !== 0) throw new Error(result.err || '字典保存失败')
    dialogOpen.value = false
    ElMessage.success('字典项已保存')
    emit('saved')
  } catch (error) {
    formError.value = error instanceof Error ? error.message : '字典保存失败'
  } finally {
    saving.value = false
  }
}

watch(dialogOpen, function initializeForm(open) {
  if (open) resetForm()
})
</script>
