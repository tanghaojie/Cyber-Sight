import type { ErrorResponse } from '@scaffold/api-contract'
import { getAccessToken } from '@/shared/accessToken'
import { handleGlobalHttpError } from './globalHttpError'

type QueryValue = string | number | boolean | undefined

interface RequestOptions<TBody = never> {
  body?: TBody
  query?: Record<string, QueryValue>
}

export interface ApiResult<TResponse> {
  data?: TResponse
  error?: ErrorResponse
}

/** 只序列化已定义查询值，避免把 undefined 发送成字符串。 */
function requestUrl(path: string, query: Record<string, QueryValue> | undefined): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) {
      search.set(key, String(value))
    }
  }

  const querystring = search.toString()
  return `/api${path}${querystring ? `?${querystring}` : ''}`
}

function isErrorResponse(value: unknown): value is ErrorResponse {
  // HTTP 200 仍可能携带非零业务状态，因此需要在传回模块 API 前识别失败结构。
  return (
    typeof value === 'object' &&
    value !== null &&
    'status' in value &&
    typeof value.status === 'number' &&
    value.status !== 0 &&
    'err' in value &&
    typeof value.err === 'string'
  )
}

async function request<TResponse, TBody = never>(
  method: string,
  path: string,
  options: RequestOptions<TBody> = {},
): Promise<ApiResult<TResponse>> {
  const headers: Record<string, string> = {}
  const token = getAccessToken()
  if (token) {
    headers.authorization = `Bearer ${token}`
  }
  if (options.body !== undefined) {
    headers['content-type'] = 'application/json'
  }

  const response = await fetch(requestUrl(path, options.query), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

  // 401/404/500 先触发应用级导航和会话副作用；响应体仍继续解析给调用方。
  await handleGlobalHttpError(response)
  const payload: unknown = await response.json()

  if (isErrorResponse(payload)) {
    return { error: payload }
  }

  return { data: payload as TResponse }
}

export const apiClient = {
  GET<TResponse>(path: string, options?: RequestOptions): Promise<ApiResult<TResponse>> {
    return request<TResponse>('GET', path, options)
  },
  POST<TResponse, TBody = never>(
    path: string,
    options?: RequestOptions<TBody>,
  ): Promise<ApiResult<TResponse>> {
    return request<TResponse, TBody>('POST', path, options)
  },
  PUT<TResponse, TBody>(
    path: string,
    options: RequestOptions<TBody>,
  ): Promise<ApiResult<TResponse>> {
    return request<TResponse, TBody>('PUT', path, options)
  },
  DELETE<TResponse>(path: string): Promise<ApiResult<TResponse>> {
    return request<TResponse>('DELETE', path)
  },
}
