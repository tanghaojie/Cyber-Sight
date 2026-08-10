import type {
  ApiResponse,
  EmptySuccessResponse,
  IdResponse,
  PersonalProfile,
  PersonalProfileResponse,
  PersonalProfileUpdate,
  PasswordUpdate,
  PaginatedResponse,
  UserCreate,
  UserSummary,
  UserUpdate,
} from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/api/result'

// 用户模块 API 只封装路径、契约类型和结果归一化，页面不直接调用通用 HTTP 客户端。
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

export async function getPersonalProfile(): Promise<ApiResponse<PersonalProfile>> {
  const { data, error } = await apiClient.GET<PersonalProfileResponse>('/account/profile')
  return apiResult(data, error)
}

export async function updatePersonalProfile(
  payload: PersonalProfileUpdate,
): Promise<ApiResponse<PersonalProfile>> {
  const { data, error } = await apiClient.PUT<PersonalProfileResponse, PersonalProfileUpdate>(
    '/account/profile',
    { body: payload },
  )
  return apiResult(data, error)
}

export async function updatePersonalPassword(payload: PasswordUpdate) {
  const { data, error } = await apiClient.PUT<EmptySuccessResponse, PasswordUpdate>(
    '/account/password',
    { body: payload },
  )
  return apiResult(data, error)
}
