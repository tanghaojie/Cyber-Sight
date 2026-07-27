import type { EmptySuccessResponse, IdResponse, PaginatedResponse, RoleRequest, RoleSummary } from '@scaffold/api-contract'
import { apiClient } from '../../api/client.js'
import { apiResult, pageResult, type ApiMutationResult } from '../../api/result.js'

export interface RoleOption { id: number; name: string; code: string }

export async function listRoles(pageNum: number, pageSize: number, keyword = '') {
  const { data, error } = await apiClient.GET<PaginatedResponse<RoleSummary>>('/admin/roles', { query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) } })
  return pageResult(data, error)
}

export async function listRoleOptions(): Promise<RoleOption[]> {
  const result = await listRoles(1, 100)
  if (result.status !== 0) throw new Error(result.err || '角色选项加载失败')
  return result.list.filter((role) => role.enabled).map(({ id, name, code }) => ({ id, name, code }))
}

export async function createRole(payload: RoleRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, RoleRequest>('/admin/roles', { body: payload })
  return apiResult(data, error)
}

export async function updateRole(id: number, payload: RoleRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, RoleRequest>(`/admin/roles/${id}`, { body: payload })
  return apiResult(data, error)
}

export async function deleteRole(id: number) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/roles/${id}`)
  return apiResult(data, error)
}
