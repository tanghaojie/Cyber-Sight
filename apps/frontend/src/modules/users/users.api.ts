import type {
  EmptySuccessResponse,
  IdResponse,
  PaginatedResponse,
  UserCreate,
  UserSummary,
  UserUpdate,
} from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/api/result'

export async function listUsers(pageNum: number, pageSize: number, keyword = '') {
  const { data, error } = await apiClient.GET<PaginatedResponse<UserSummary>>('/admin/users', {
    query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) },
  })
  return pageResult(data, error)
}

export async function createUser(payload: UserCreate): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, UserCreate>('/admin/users', {
    body: payload,
  })
  return apiResult(data, error)
}

export async function updateUser(id: number, payload: UserUpdate): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, UserUpdate>(`/admin/users/${id}`, {
    body: payload,
  })
  return apiResult(data, error)
}

export async function deleteUser(id: number) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/users/${id}`)
  return apiResult(data, error)
}
