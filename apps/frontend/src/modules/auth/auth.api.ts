import type {
  ApiResponse,
  CurrentUser,
  CurrentUserResponse,
  EmptySuccessResponse,
  LoginData,
  LoginRequest,
  LoginSuccessResponse,
} from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { apiResult } from '@/api/result'

export async function login(username: string, password: string): Promise<ApiResponse<LoginData>> {
  const { data, error } = await apiClient.POST<LoginSuccessResponse, LoginRequest>('/auth/login', {
    body: { username, password },
  })

  return apiResult(data, error)
}

export async function gerCurrentUser(): Promise<ApiResponse<CurrentUser>> {
  const { data, error } = await apiClient.GET<CurrentUserResponse>('/auth/me')

  return apiResult(data, error)
}

export async function logout() {
  const { data, error } = await apiClient.POST<EmptySuccessResponse>('/auth/logout')

  return apiResult(data, error)
}
