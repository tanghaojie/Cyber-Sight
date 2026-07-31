import type {
  EmptySuccessResponse,
  IdResponse,
  PaginatedResponse,
  RoleRequest,
  RoleSummary,
} from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/api/result'
import { translate } from '@/modules/system/localization/localization'

// 角色模块同时提供管理分页和用户表单所需的轻量选项映射。
export interface RoleOption {
  id: number
  name: string
  code: string
}

export async function listRoles(pageNum: number, pageSize: number, keyword = '') {
  const { data, error } = await apiClient.GET<PaginatedResponse<RoleSummary>>('/admin/roles', {
    query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) },
  })
  return pageResult(data, error)
}

export async function listRoleOptions(): Promise<RoleOption[]> {
  // 后端分页上限为 100，当前脚手架用首批有效角色作为选择项。
  const result = await listRoles(1, 100)
  if (result.status !== 0) {
    throw new Error(translate('roles.errors.optionsLoadFailed'))
  }
  return result.list
    .filter((role) => role.enabled)
    .map(({ id, name, code }) => ({ id, name, code }))
}

export async function createRole(payload: RoleRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, RoleRequest>('/admin/roles', {
    body: payload,
  })
  return apiResult(data, error)
}

export async function updateRole(id: number, payload: RoleRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, RoleRequest>(`/admin/roles/${id}`, {
    body: payload,
  })
  return apiResult(data, error)
}

export async function deleteRole(id: number) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/roles/${id}`)
  return apiResult(data, error)
}
