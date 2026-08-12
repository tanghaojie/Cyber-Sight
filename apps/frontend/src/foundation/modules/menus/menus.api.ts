import type {
  EmptySuccessResponse,
  EntityId,
  IdResponse,
  MenuListResponse,
  MenuRequest,
  MenuSummary,
  PaginatedResponse,
} from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/foundation/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/foundation/api/result'
import { translate } from '@/foundation/modules/localization/localization'

// 菜单管理页使用全量树接口；分页接口保留给普通管理列表或后续搜索场景。
export async function listMenus(pageNum: number, pageSize: number, keyword = '') {
  const { data, error } = await apiClient.GET<PaginatedResponse<MenuSummary>>('/admin/menus', {
    query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) },
  })
  return pageResult(data, error)
}

export async function listAllMenus(): Promise<MenuSummary[]> {
  // 树构建在前端完成，因此这里返回后端提供的全部扁平菜单记录。
  const { data, error } = await apiClient.GET<MenuListResponse>('/admin/menus/tree')
  const result = data ?? error
  if (!result || result.status !== 0 || !('data' in result)) {
    throw new Error(translate('menus.errors.optionsLoadFailed'))
  }
  return result.data
}

export async function createMenu(payload: MenuRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, MenuRequest>('/admin/menus', {
    body: payload,
  })
  return apiResult(data, error)
}

export async function updateMenu(id: EntityId, payload: MenuRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, MenuRequest>(`/admin/menus/${id}`, {
    body: payload,
  })
  return apiResult(data, error)
}

export async function deleteMenu(id: EntityId) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/menus/${id}`)
  return apiResult(data, error)
}
