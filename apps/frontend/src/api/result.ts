import type { ApiResponse, ErrorResponse, PaginatedResponse } from '@scaffold/api-contract'

export function apiResult<T>(
  data: T | undefined,
  error: ErrorResponse | undefined,
): T | ErrorResponse {
  if (data) return data
  if (error) return error
  throw new Error('Backend returned an empty response')
}

export function pageResult<T>(
  data: PaginatedResponse<T> | undefined,
  error: ErrorResponse | undefined,
): PaginatedResponse<T> {
  if (data) return data
  if (error) return { ...error, list: [], total: 0 }
  throw new Error('Backend returned an empty response')
}

export type ApiMutationResult = ApiResponse<{ id: number }>
