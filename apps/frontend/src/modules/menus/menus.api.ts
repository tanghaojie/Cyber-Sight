import type {
  EmptySuccessResponse,
  IdResponse,
  MenuListResponse,
  MenuRequest,
  MenuSummary,
  PaginatedResponse,
} from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/api/result'

export async function listMenus(pageNum: number, pageSize: number, keyword = '') {
  const { data, error } = await apiClient.GET<PaginatedResponse<MenuSummary>>('/admin/menus', {
    query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) },
  })
  return pageResult(data, error)
}

export async function listAllMenus(): Promise<MenuSummary[]> {
  const { data, error } = await apiClient.GET<MenuListResponse>('/admin/menus/tree')
  const result = data ?? error
  if (!result || result.status !== 0 || !('data' in result))
    throw new Error(result && 'err' in result ? result.err : '菜单选项加载失败')
  return result.data
}

export async function createMenu(payload: MenuRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, MenuRequest>('/admin/menus', {
    body: payload,
  })
  return apiResult(data, error)
}

export async function updateMenu(id: number, payload: MenuRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, MenuRequest>(`/admin/menus/${id}`, {
    body: payload,
  })
  return apiResult(data, error)
}

export async function deleteMenu(id: number) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/menus/${id}`)
  return apiResult(data, error)
}
