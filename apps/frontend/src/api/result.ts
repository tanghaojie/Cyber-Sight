import { BACKEND_RETURNED_AN_INVALID_RESPONSE } from '@/shared/errMsg'
import type { ApiResponse, ErrorResponse, PaginatedResponse } from '@scaffold/api-contract'
import { ElMessage } from 'element-plus'

/** 把 HTTP 客户端的 data/error 双通道还原为共享契约定义的单一业务响应。 */
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
  // 分页调用方始终需要 list/total；无法识别响应时在此统一提示并中止。
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
