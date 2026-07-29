import type {
  DictionaryRequest,
  DictionarySummary,
  EmptySuccessResponse,
  IdResponse,
  LoginRequest,
  LoginSuccessResponse,
  PaginatedResponse,
} from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/api/result'

export async function listDictionaries(username: string, password: string) {
  const { data, error } = await apiClient.POST<LoginSuccessResponse, LoginRequest>('/auth/login', {
    body: { username, password },
  })
  return apiResult(data, error)
}
