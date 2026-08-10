import type {
  ApiResponse,
  EntityId,
  ErrorResponse,
  PaginatedResponse,
} from '@cyber-ai-forge/api-contract'
import { ElMessage } from 'element-plus'
import { translate } from '@/modules/system/localization/localization'

function invalidResponseMessage(): string {
  return translate('shared.messages.invalidResponse')
}

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
  const message = invalidResponseMessage()
  ElMessage.error(message)
  throw new Error(message)
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
  const message = invalidResponseMessage()
  ElMessage.error(message)
  throw new Error(message)
}

export type ApiMutationResult = ApiResponse<{ id: EntityId }>
