import type { ErrorResponse } from '@scaffold/api-contract'
import { getAccessToken } from '@/shared/accessToken.js'
import { handleGlobalHttpError } from './global-http-error.js'

type QueryValue = string | number | boolean | undefined

interface RequestOptions<TBody = never> {
  body?: TBody
  query?: Record<string, QueryValue>
}

export interface ApiResult<TResponse> {
  data?: TResponse
  error?: ErrorResponse
}

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
  if (token) headers.authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['content-type'] = 'application/json'

  const response = await fetch(requestUrl(path, options.query), {
    method,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body),
  })

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
