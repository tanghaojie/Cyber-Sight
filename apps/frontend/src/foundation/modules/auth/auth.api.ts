import type {
  ApiResponse,
  CurrentUser,
  CurrentUserResponse,
  EmptySuccessResponse,
  LoginData,
  LoginRequest,
  LoginSuccessResponse,
} from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/foundation/api/client'
import { apiResult } from '@/foundation/api/result'

// 认证模块 API 负责把通用客户端结果恢复成共享契约响应，Store 再处理会话状态。
export async function login(username: string, password: string): Promise<ApiResponse<LoginData>> {
  const { data, error } = await apiClient.POST<LoginSuccessResponse, LoginRequest>('/auth/login', {
    body: { username, password },
  })

  return apiResult(data, error)
}

export async function getCurrentUser(): Promise<ApiResponse<CurrentUser>> {
  const { data, error } = await apiClient.GET<CurrentUserResponse>('/auth/me')

  return apiResult(data, error)
}

export async function logout() {
  const { data, error } = await apiClient.POST<EmptySuccessResponse>('/auth/logout')

  return apiResult(data, error)
}
