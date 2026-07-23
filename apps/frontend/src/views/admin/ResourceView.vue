<template>
  <section class="mx-auto grid max-w-[1480px] gap-5">
    <div class="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p class="mb-2 text-[9px] font-black tracking-[.2em] text-[#679078] uppercase">{{ config.eyebrow }}</p>
        <h2 class="font-display text-2xl font-black tracking-[-.035em] text-[#203029]">{{ config.title }}</h2>
        <p class="mt-2 text-xs leading-5 text-[#7c8b82]">{{ config.description }}</p>
      </div>
      <el-button type="primary" :icon="Plus" size="large" @click="openCreate">新增{{ config.singular }}</el-button>
    </div>

    <div class="overflow-hidden rounded-[26px] border border-[#dce2dc] bg-white/80 shadow-[0_18px_50px_rgba(32,56,47,.06)]">
      <div class="flex min-h-20 flex-col gap-3 border-b border-[#e3e7e2] p-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <el-input v-model="keyword" class="max-w-md" clearable :prefix-icon="Search" placeholder="搜索名称、编码或关键信息" size="large" @keyup.enter="search" @clear="search" />
        <div class="text-[11px] font-semibold text-[#87948c]">当前共 <strong class="mx-1 text-sm font-black text-[#2b4539]">{{ total }}</strong> 条记录</div>
      </div>

      <el-alert v-if="message" class="mx-4 mt-4 !w-auto" :title="message" :type="messageType === 'error' ? 'error' : 'success'" show-icon :closable="false" />

      <el-table v-loading="loading" :data="records" class="resource-table" row-key="id" empty-text="暂无数据">
        <el-table-column v-for="column in config.columns" :key="column.key" :label="column.label" min-width="135">
          <template #default="{ row }">
            <el-tag v-if="column.key === 'enabled'" :type="displayValue(row, column.key) ? 'success' : 'info'" effect="light" round>
              {{ displayValue(row, column.key) ? '启用' : '停用' }}
            </el-tag>
            <span v-else-if="column.key === 'updatedAt'" class="text-xs text-[#7f8c84]">{{ formatDate(String(displayValue(row, column.key))) }}</span>
            <el-tag v-else-if="column.array" effect="plain" round>{{ formatArray(displayValue(row, column.key)) }}</el-tag>
            <span v-else class="text-xs font-semibold text-[#34463e]">{{ displayValue(row, column.key) || '—' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="112">
          <template #default="{ row }">
            <div class="flex gap-1">
              <el-button circle text :icon="EditPen" title="编辑" @click="openEdit(row)" />
              <el-button circle text type="danger" :icon="Delete" title="删除" @click="confirmDelete(row)" />
            </div>
          </template>
        </el-table-column>
        <template #empty>
          <div class="grid min-h-60 place-items-center content-center gap-2">
            <span class="grid size-12 place-items-center rounded-2xl bg-[#eef1ed] text-2xl text-[#92a097]">◇</span>
            <b class="mt-2 text-xs text-[#56675e]">暂无数据</b>
            <span class="text-[11px] text-[#98a39d]">可以点击右上角按钮新增{{ config.singular }}</span>
          </div>
        </template>
      </el-table>

      <div class="flex min-h-20 items-center justify-end border-t border-[#e5e9e4] px-4 sm:px-5">
        <el-pagination v-model:current-page="pageNum" :page-size="pageSize" :total="total" layout="prev, pager, next" background :disabled="loading" @current-change="changePage" />
      </div>
    </div>

    <el-dialog v-model="dialogOpen" :title="editingId ? `编辑${config.singular}` : `新增${config.singular}`" width="min(680px, calc(100vw - 32px))" :close-on-click-modal="!saving" :close-on-press-escape="!saving" class="resource-dialog">
      <p class="-mt-4 mb-6 text-[10px] font-black tracking-[.18em] text-[#699079] uppercase">{{ editingId ? 'Edit record' : 'New record' }}</p>
      <form class="grid grid-cols-1 gap-x-5 gap-y-4 sm:grid-cols-2" @submit.prevent="submitForm">
        <div v-for="field in config.fields" :key="field.key" class="grid gap-2" :class="{ 'sm:col-span-2': field.wide || field.type === 'checkbox' }">
          <template v-if="field.type === 'checkbox'">
            <div class="flex min-h-10 items-center justify-between rounded-xl bg-[#f3f5f1] px-4">
              <label :for="field.key" class="text-xs font-bold text-[#45574e]">{{ field.label }}</label>
              <el-switch :id="field.key" v-model="form[field.key]" />
            </div>
          </template>
          <template v-else>
            <label :for="field.key" class="text-xs font-bold text-[#45574e]">{{ field.label }}<em v-if="field.required" class="ml-1 not-italic text-red-500">*</em></label>
            <el-select v-if="field.type === 'select'" :id="field.key" v-model="form[field.key]" class="w-full" :placeholder="field.placeholder" size="large">
              <el-option v-for="option in field.options" :key="option.value" :label="option.label" :value="option.value" />
            </el-select>
            <el-input v-else :id="field.key" v-model="form[field.key]" :type="field.type === 'textarea' ? 'textarea' : field.type" :rows="field.type === 'textarea' ? 3 : undefined" :disabled="Boolean(editingId && field.createOnly)" :placeholder="editingId && field.key === 'password' ? '留空则不修改密码' : field.placeholder" size="large" />
          </template>
        </div>
        <el-alert v-if="formError" class="sm:col-span-2" :title="formError" type="error" show-icon :closable="false" />
        <div class="mt-2 flex justify-end gap-2 border-t border-[#e6eae5] pt-5 sm:col-span-2">
          <el-button size="large" @click="closeDialog">取消</el-button>
          <el-button native-type="submit" type="primary" size="large" :loading="saving">保存</el-button>
        </div>
      </form>
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { Delete, EditPen, Plus, Search } from '@element-plus/icons-vue'
import { createResource, deleteResource, listResource, updateResource, type AdminRecord, type ResourceKind } from '../../modules/admin/admin.api.js'

interface Column { key: string; label: string; array?: boolean }
interface Field { key: string; label: string; type: string; required?: boolean; createOnly?: boolean; wide?: boolean; placeholder?: string; options?: { label: string; value: string }[] }
interface Config { title: string; singular: string; eyebrow: string; description: string; columns: Column[]; fields: Field[]; defaults: Record<string, unknown> }

const props = defineProps<{ resource: ResourceKind }>()
const configs: Record<ResourceKind, Config> = {
  users: { title: '用户管理', singular: '用户', eyebrow: 'IDENTITY & ACCESS', description: '管理系统账号、基础资料与角色归属。', columns: [{key:'username',label:'用户名'},{key:'displayName',label:'姓名'},{key:'email',label:'邮箱'},{key:'roleIds',label:'角色',array:true},{key:'enabled',label:'状态'},{key:'updatedAt',label:'更新时间'}], fields: [{key:'username',label:'用户名',type:'text',required:true,createOnly:true,placeholder:'例如 zhangsan'},{key:'displayName',label:'姓名',type:'text',required:true,placeholder:'请输入姓名'},{key:'email',label:'邮箱',type:'email',required:true,placeholder:'name@example.com'},{key:'password',label:'密码',type:'password',required:true,placeholder:'至少 8 个字符'},{key:'roleIds',label:'角色 ID',type:'text',wide:true,placeholder:'多个 ID 用逗号分隔，例如 1,2'},{key:'enabled',label:'启用该用户',type:'checkbox'}], defaults: { username:'',displayName:'',email:'',password:'',roleIds:'',enabled:true } },
  roles: { title:'角色管理',singular:'角色',eyebrow:'ROLE BASELINE',description:'定义职责角色并维护菜单授权范围。',columns:[{key:'name',label:'角色名称'},{key:'code',label:'角色编码'},{key:'description',label:'描述'},{key:'menuIds',label:'菜单',array:true},{key:'enabled',label:'状态'},{key:'updatedAt',label:'更新时间'}],fields:[{key:'name',label:'角色名称',type:'text',required:true,placeholder:'例如 运营管理员'},{key:'code',label:'角色编码',type:'text',required:true,placeholder:'例如 OPERATOR_ADMIN'},{key:'description',label:'描述',type:'textarea',wide:true,placeholder:'说明角色职责边界'},{key:'menuIds',label:'菜单 ID',type:'text',wide:true,placeholder:'多个 ID 用逗号分隔'},{key:'enabled',label:'启用该角色',type:'checkbox'}],defaults:{name:'',code:'',description:'',menuIds:'',enabled:true}},
  menus: { title:'菜单管理',singular:'菜单',eyebrow:'NAVIGATION MODEL',description:'维护导航结构、路由与展示顺序。',columns:[{key:'name',label:'菜单名称'},{key:'code',label:'菜单编码'},{key:'path',label:'路由'},{key:'type',label:'类型'},{key:'sortOrder',label:'排序'},{key:'enabled',label:'状态'}],fields:[{key:'name',label:'菜单名称',type:'text',required:true,placeholder:'请输入菜单名称'},{key:'code',label:'菜单编码',type:'text',required:true,placeholder:'例如 REPORT_CENTER'},{key:'parentId',label:'上级菜单 ID',type:'number',required:true,placeholder:'顶级菜单填 0'},{key:'sortOrder',label:'排序',type:'number',required:true,placeholder:'数字越小越靠前'},{key:'path',label:'路由路径',type:'text',placeholder:'/reports'},{key:'icon',label:'图标名称',type:'text',placeholder:'例如 menu'},{key:'type',label:'菜单类型',type:'select',required:true,options:[{label:'目录',value:'directory'},{label:'菜单',value:'menu'},{label:'按钮',value:'button'}]},{key:'enabled',label:'启用该菜单',type:'checkbox'}],defaults:{name:'',code:'',parentId:0,sortOrder:0,path:'',icon:'',type:'menu',enabled:true}},
  dictionaries: { title:'字典管理',singular:'字典项',eyebrow:'REFERENCE DATA',description:'集中维护稳定、可复用的枚举与展示值。',columns:[{key:'type',label:'字典类型'},{key:'label',label:'显示名称'},{key:'value',label:'字典值'},{key:'sortOrder',label:'排序'},{key:'enabled',label:'状态'},{key:'updatedAt',label:'更新时间'}],fields:[{key:'type',label:'字典类型',type:'text',required:true,placeholder:'例如 order_status'},{key:'label',label:'显示名称',type:'text',required:true,placeholder:'例如 待处理'},{key:'value',label:'字典值',type:'text',required:true,placeholder:'例如 pending'},{key:'sortOrder',label:'排序',type:'number',required:true,placeholder:'请输入排序值'},{key:'remark',label:'备注',type:'textarea',wide:true,placeholder:'补充说明（可选）'},{key:'enabled',label:'启用该字典项',type:'checkbox'}],defaults:{type:'',label:'',value:'',sortOrder:0,remark:'',enabled:true}}
}

const config = computed(() => configs[props.resource])
const records = ref<AdminRecord[]>([])
const total = ref(0), pageNum = ref(1), pageSize = 10, keyword = ref('')
const loading = ref(false), saving = ref(false), dialogOpen = ref(false)
const editingId = ref<number | null>(null), message = ref(''), messageType = ref('success'), formError = ref('')
const form = reactive<Record<string, any>>({})

async function load() { loading.value=true; message.value=''; try { const result=await listResource(props.resource,pageNum.value,pageSize,keyword.value); if(result.status!==0) throw new Error(result.err||'加载失败'); records.value=result.list; total.value=result.total } catch(error) { records.value=[]; total.value=0; messageType.value='error'; message.value=error instanceof Error?error.message:'加载失败，请稍后重试' } finally { loading.value=false } }
function search(){ pageNum.value=1; void load() }
function changePage(value:number){ pageNum.value=value; void load() }
function resetForm(){ Object.keys(form).forEach((key)=>delete form[key]); Object.assign(form,config.value.defaults) }
function openCreate(){ editingId.value=null; resetForm(); formError.value=''; dialogOpen.value=true }
function displayValue(record:AdminRecord,key:string){ return (record as unknown as Record<string,unknown>)[key] }
function openEdit(record:AdminRecord){ editingId.value=record.id; resetForm(); for(const field of config.value.fields){ const value=displayValue(record,field.key); if(Array.isArray(value)) form[field.key]=value.join(','); else if(value!==undefined&&value!==null) form[field.key]=value } if('password' in form) form.password=''; formError.value=''; dialogOpen.value=true }
function closeDialog(){ if(!saving.value) dialogOpen.value=false }
function normalizePayload(){ const payload:{[key:string]:unknown}={...form}; for(const key of ['roleIds','menuIds']){ if(key in payload) payload[key]=String(payload[key]??'').split(',').map(v=>Number(v.trim())).filter(v=>Number.isInteger(v)&&v>0) } for(const key of ['parentId','sortOrder']) if(key in payload) payload[key]=Number(payload[key]); if(editingId.value&&props.resource==='users'){ delete payload.username; if(!payload.password) delete payload.password } return payload }
async function submitForm(){ saving.value=true; formError.value=''; try { const payload=normalizePayload(); const result=editingId.value?await updateResource(props.resource,editingId.value,payload):await createResource(props.resource,payload); if(result.status!==0) throw new Error(result.err||'保存失败'); dialogOpen.value=false; messageType.value='success'; message.value=`${config.value.singular}已保存`; await load() } catch(error){ formError.value=error instanceof Error?error.message:'保存失败，请检查输入' } finally { saving.value=false } }
async function confirmDelete(record:AdminRecord){ if(!window.confirm(`确定删除这条${config.value.singular}记录吗？数据将进入软删除状态。`)) return; try { const result=await deleteResource(props.resource,record.id); if(result.status!==0) throw new Error(result.err||'删除失败'); messageType.value='success'; message.value=`${config.value.singular}已删除`; await load() } catch(error){ messageType.value='error'; message.value=error instanceof Error?error.message:'删除失败' } }
function formatDate(value:string){ const date=new Date(value); return Number.isNaN(date.getTime())?'—':new Intl.DateTimeFormat('zh-CN',{year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'}).format(date) }
function formatArray(value:unknown){ return Array.isArray(value)&&value.length?value.join(' · '):'未配置' }
watch(()=>props.resource,()=>{ pageNum.value=1; keyword.value=''; void load() },{immediate:true})
</script>

<style scoped>
.resource-page{display:grid;gap:22px}.page-intro{display:flex;align-items:flex-end;justify-content:space-between;gap:20px}.page-intro p{margin:0 0 7px;color:#8a8fca;font-size:9px;font-weight:800;letter-spacing:.18em}.page-intro h2{margin:0;color:#202739;font-size:25px;letter-spacing:-.03em}.page-intro span{display:block;margin-top:8px;color:#858d9f;font-size:13px}.resource-card{overflow:hidden;border:1px solid #e6e8ef;border-radius:17px;background:#fff;box-shadow:var(--shadow)}.toolbar{min-height:73px;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:14px 19px;border-bottom:1px solid #eceef3}.search-box{width:min(100%,390px);display:flex;align-items:center;gap:10px;min-height:42px;padding:0 12px;border:1px solid #e0e3eb;border-radius:11px;color:#9ba2b2;background:#fafbfc}.search-box input{min-width:0;flex:1;border:0;outline:0;color:#343b4d;background:transparent;font-size:12px}.search-box button{border:0;color:#9aa1af;background:transparent;font-size:18px}.record-count{color:#969dac;font-size:11px}.record-count strong{color:#596176;font-size:13px}.table-wrap{overflow:auto}table{width:100%;min-width:880px;border-collapse:collapse;text-align:left}th{height:46px;padding:0 17px;color:#9299a8;background:#fafbfc;border-bottom:1px solid #eceef3;font-size:10px;font-weight:750;letter-spacing:.04em}td{height:62px;padding:10px 17px;color:#3e4658;border-bottom:1px solid #f0f1f5;font-size:12px}tbody tr{transition:140ms}tbody tr:hover{background:#fcfcff}.subtle{color:#8e95a4}.tag{display:inline-flex;padding:4px 8px;border-radius:6px;color:#6767c9;background:#f0f0ff;font-size:10px}.row-actions{display:flex;gap:6px}.row-actions button{width:31px;height:31px;display:grid;place-items:center;border:1px solid #e5e7ed;border-radius:8px;color:#777f90;background:#fff}.row-actions button:hover{color:var(--primary);border-color:#ccccf1}.row-actions button.danger:hover{color:var(--danger);border-color:#f0cbd1}.row-actions .icon{width:15px;height:15px}.state{min-height:250px;display:grid;place-items:center;align-content:center;gap:10px;color:#9299aa}.state p{margin:0;font-size:13px}.state span{font-size:11px}.empty-symbol{font-size:35px;color:#b9bed0}.spinner{width:24px;height:24px;border:2px solid #e6e6f3;border-top-color:var(--primary);border-radius:50%;animation:spin .7s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}.pagination{min-height:66px;display:flex;align-items:center;justify-content:flex-end;gap:13px;padding:0 19px;color:#8c93a3;font-size:11px}.pagination button{width:33px;height:33px;display:grid;place-items:center;border:1px solid #e3e5ec;border-radius:8px;color:#747c8e;background:#fff}.pagination button:disabled{opacity:.4;cursor:not-allowed}.pagination .icon{width:15px}.inline-message{margin:14px 18px 0;padding:10px 12px;border-radius:9px;font-size:11px}.inline-message.success{color:#177b59;background:#edf9f4}.inline-message.error{color:#b83b4d;background:#fff1f3}.dialog-backdrop{position:fixed;inset:0;z-index:100;display:grid;place-items:center;padding:22px;background:rgba(17,20,34,.48);backdrop-filter:blur(3px)}.dialog{width:min(100%,650px);max-height:calc(100vh - 44px);overflow:auto;border-radius:18px;background:#fff;box-shadow:0 26px 80px rgba(17,20,35,.25)}.dialog header{display:flex;justify-content:space-between;align-items:center;padding:23px 26px;border-bottom:1px solid var(--line)}.dialog header small{color:#8c8ed0;font-size:9px;font-weight:800;letter-spacing:.16em}.dialog h3{margin:6px 0 0;font-size:20px}.dialog header button{width:34px;height:34px;display:grid;place-items:center;border:0;border-radius:9px;color:#8c93a2;background:#f3f4f7}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;padding:24px 26px}.field.wide{grid-column:1/-1}.field em{margin-left:3px;color:var(--danger);font-style:normal}.field.checkbox{display:flex;grid-column:1/-1;grid-template-columns:auto 1fr;align-items:center}.field.checkbox input{width:17px;height:17px;accent-color:var(--primary)}textarea.control{resize:vertical}.dialog footer{display:flex;justify-content:flex-end;gap:10px;padding:18px 26px;border-top:1px solid var(--line);background:#fbfbfc}.login-error{margin:0 26px 20px;padding:11px;border-radius:9px;color:#b83b4d;background:#fff1f3;font-size:11px}
@media(max-width:650px){.page-intro{align-items:stretch;flex-direction:column}.page-intro .btn{align-self:flex-start}.toolbar{align-items:stretch;flex-direction:column}.search-box{width:100%}.record-count{display:none}.form-grid{grid-template-columns:1fr;padding:20px}.field.wide{grid-column:auto}.dialog header,.dialog footer{padding-left:20px;padding-right:20px}}

:deep(.resource-table) {
  --el-table-border-color: #e7ebe7;
  --el-table-header-bg-color: #f1f3ee;
  --el-table-row-hover-bg-color: #f6f8f4;
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
}

:deep(.resource-table th.el-table__cell) {
  height: 48px;
  color: #74827a;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: .04em;
}

:deep(.resource-table td.el-table__cell) {
  height: 64px;
}
</style>
