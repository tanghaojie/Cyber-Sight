import type {
  DictionaryRequest,
  DictionarySummary,
  EmptySuccessResponse,
  IdResponse,
  PaginatedResponse,
} from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/api/result'

// 字典模块 API 统一封装分页查询和三个写操作，页面只处理业务 status。
export async function listDictionaries(pageNum: number, pageSize: number, keyword = '') {
  const { data, error } = await apiClient.GET<PaginatedResponse<DictionarySummary>>(
    '/admin/dictionaries',
    { query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) } },
  )
  return pageResult(data, error)
}

export async function createDictionary(payload: DictionaryRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, DictionaryRequest>(
    '/admin/dictionaries',
    { body: payload },
  )
  return apiResult(data, error)
}

export async function updateDictionary(
  id: number,
  payload: DictionaryRequest,
): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, DictionaryRequest>(
    `/admin/dictionaries/${id}`,
    { body: payload },
  )
  return apiResult(data, error)
}

export async function deleteDictionary(id: number) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/dictionaries/${id}`)
  return apiResult(data, error)
}
