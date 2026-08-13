import type {
  ApiResponse,
  PaginatedResponse,
  PaginationRequest,
} from '@cyber-ai-forge/api-contract'
import { ErrorCode } from '@/foundation/shared/errors/error-codes.js'

// 重载区分“无 data 的成功写操作”和“带 data 的成功查询”，同时保持统一运行时实现。
export function success<T>(data: T): { status: 0; data: T }
export function success(): { status: 0 }
export function success<T>(data?: T): ApiResponse<T> {
  if (data === undefined) {
    return { status: ErrorCode.SUCCESS }
  }

  return { status: ErrorCode.SUCCESS, data }
}

export function failure(status: number, err: string): ApiResponse<never> {
  // 防止调用方误把成功码包装成失败结构，破坏前端判定约定。
  if (status === ErrorCode.SUCCESS) {
    throw new Error('Failure responses must use a non-zero error code')
  }

  return { status, err }
}

export function paginatedSuccess<T>(
  list: T[],
  total: number,
): { status: 0; list: T[]; total: number } {
  // 分页成功始终保留 list 和 total，即使当前页为空，前端可据此稳定计算分页状态。
  return {
    status: ErrorCode.SUCCESS,
    list,
    total,
  }
}

export function paginatedFailure(status: number, err: string): PaginatedResponse<never> {
  // 失败时返回空列表和零总数，避免旧页面误用上一次成功结果。
  if (status === ErrorCode.SUCCESS) {
    throw new Error('Failure responses must use a non-zero error code')
  }

  return {
    status,
    list: [],
    total: 0,
    err,
  }
}

export function normalizePagination(request: PaginationRequest = {}): Required<PaginationRequest> {
  // HTTP Schema 会限制外部输入；这里仍保护仓储和测试中的直接函数调用。
  // 不在这里裁剪过大的页码或页大小，避免绕过共享契约对输入边界的统一定义。
  const pageNum = request.pageNum ?? 1
  const pageSize = request.pageSize ?? 10

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    throw new RangeError('pageNum must be a positive integer')
  }

  if (!Number.isInteger(pageSize) || pageSize < 1) {
    throw new RangeError('pageSize must be a positive integer')
  }

  return { pageNum, pageSize }
}
