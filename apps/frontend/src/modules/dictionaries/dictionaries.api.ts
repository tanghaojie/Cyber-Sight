import type { DictionaryRequest, DictionarySummary, EmptySuccessResponse, IdResponse, PaginatedResponse } from '@scaffold/api-contract'
import { apiClient } from '../../api/client.js'
import { apiResult, pageResult, type ApiMutationResult } from '../../api/result.js'

export async function listDictionaries(pageNum: number, pageSize: number, keyword = '') {
  const { data, error } = await apiClient.GET<PaginatedResponse<DictionarySummary>>('/admin/dictionaries', { query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) } })
  return pageResult(data, error)
}

export async function createDictionary(payload: DictionaryRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, DictionaryRequest>('/admin/dictionaries', { body: payload })
  return apiResult(data, error)
}

export async function updateDictionary(id: number, payload: DictionaryRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, DictionaryRequest>(`/admin/dictionaries/${id}`, { body: payload })
  return apiResult(data, error)
}

export async function deleteDictionary(id: number) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/dictionaries/${id}`)
  return apiResult(data, error)
}
