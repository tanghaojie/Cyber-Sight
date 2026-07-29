import { BACKEND_RETURNED_AN_INVALID_RESPONSE } from '@/shared/errMsg'
import type { ApiResponse, ErrorResponse, PaginatedResponse } from '@scaffold/api-contract'
import { ElMessage } from 'element-plus'

export function apiResult<T>(
  data: T | undefined,
  error: ErrorResponse | undefined,
): T | ErrorResponse {
  if (data) {
    return data
  }
  if (error) {
    return error
  }
  ElMessage.error(BACKEND_RETURNED_AN_INVALID_RESPONSE)
  throw new Error(BACKEND_RETURNED_AN_INVALID_RESPONSE)
}

export function pageResult<T>(
  data: PaginatedResponse<T> | undefined,
  error: ErrorResponse | undefined,
): PaginatedResponse<T> {
  if (data) {
    return data
  }
  if (error) {
    return { ...error, list: [], total: 0 }
  }
  ElMessage.error(BACKEND_RETURNED_AN_INVALID_RESPONSE)
  throw new Error(BACKEND_RETURNED_AN_INVALID_RESPONSE)
}

export type ApiMutationResult = ApiResponse<{ id: number }>
