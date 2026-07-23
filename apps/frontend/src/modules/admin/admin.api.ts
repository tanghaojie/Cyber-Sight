import type {
  ApiResponse,
  DictionaryRequest,
  DictionarySummary,
  EmptySuccessResponse,
  ErrorResponse,
  IdResponse,
  MenuRequest,
  MenuSummary,
  PaginatedResponse,
  RoleRequest,
  RoleSummary,
  UserCreate,
  UserSummary,
  UserUpdate,
} from '@scaffold/api-contract'
import { apiClient } from '../../api/client.js'

export type ResourceKind = 'users' | 'roles' | 'menus' | 'dictionaries'
export type UserRecord = UserSummary
export type RoleRecord = RoleSummary
export type MenuRecord = MenuSummary
export type DictionaryRecord = DictionarySummary
export type AdminRecord =
  | UserRecord
  | RoleRecord
  | MenuRecord
  | DictionaryRecord
export type PageResult = PaginatedResponse<AdminRecord>
export type MutationResult = ApiResponse<{ id: number }>

function result<T>(
  data: T | undefined,
  error: ErrorResponse | undefined
): T | ErrorResponse {
  if (data) {
    return data
  }
  if (error) {
    return error
  }
  throw new Error('Backend returned an empty response')
}

function pageResult<T>(
  data: PaginatedResponse<T> | undefined,
  error: ErrorResponse | undefined
): PaginatedResponse<T> {
  if (data) {
    return data
  }
  if (error) {
    return { ...error, list: [], total: 0 }
  }
  throw new Error('Backend returned an empty response')
}

export async function listResource(
  resource: ResourceKind,
  pageNum: number,
  pageSize: number,
  keyword: string
): Promise<PageResult> {
  const query = { pageNum, pageSize, ...(keyword ? { keyword } : {}) }
  if (resource === 'users') {
    const { data, error } = await apiClient.GET<
      PaginatedResponse<UserSummary>
    >('/admin/users', { query })
    return pageResult(data, error)
  }
  if (resource === 'roles') {
    const { data, error } = await apiClient.GET<
      PaginatedResponse<RoleSummary>
    >('/admin/roles', { query })
    return pageResult(data, error)
  }
  if (resource === 'menus') {
    const { data, error } = await apiClient.GET<
      PaginatedResponse<MenuSummary>
    >('/admin/menus', { query })
    return pageResult(data, error)
  }
  const { data, error } = await apiClient.GET<
    PaginatedResponse<DictionarySummary>
  >('/admin/dictionaries', { query })
  return pageResult(data, error)
}

export async function createResource(
  resource: ResourceKind,
  payload: Record<string, unknown>
): Promise<MutationResult> {
  if (resource === 'users') {
    const { data, error } = await apiClient.POST<IdResponse, UserCreate>(
      '/admin/users',
      { body: payload as UserCreate }
    )
    return result(data, error)
  }
  if (resource === 'roles') {
    const { data, error } = await apiClient.POST<IdResponse, RoleRequest>(
      '/admin/roles',
      { body: payload as RoleRequest }
    )
    return result(data, error)
  }
  if (resource === 'menus') {
    const { data, error } = await apiClient.POST<IdResponse, MenuRequest>(
      '/admin/menus',
      { body: payload as MenuRequest }
    )
    return result(data, error)
  }
  const { data, error } = await apiClient.POST<IdResponse, DictionaryRequest>(
    '/admin/dictionaries',
    { body: payload as DictionaryRequest }
  )
  return result(data, error)
}

export async function updateResource(
  resource: ResourceKind,
  id: number,
  payload: Record<string, unknown>
): Promise<MutationResult> {
  if (resource === 'users') {
    const { data, error } = await apiClient.PUT<IdResponse, UserUpdate>(
      `/admin/users/${id}`,
      { body: payload as UserUpdate }
    )
    return result(data, error)
  }
  if (resource === 'roles') {
    const { data, error } = await apiClient.PUT<IdResponse, RoleRequest>(
      `/admin/roles/${id}`,
      { body: payload as RoleRequest }
    )
    return result(data, error)
  }
  if (resource === 'menus') {
    const { data, error } = await apiClient.PUT<IdResponse, MenuRequest>(
      `/admin/menus/${id}`,
      { body: payload as MenuRequest }
    )
    return result(data, error)
  }
  const { data, error } = await apiClient.PUT<IdResponse, DictionaryRequest>(
    `/admin/dictionaries/${id}`,
    { body: payload as DictionaryRequest }
  )
  return result(data, error)
}

export async function deleteResource(
  resource: ResourceKind,
  id: number
): Promise<MutationResult> {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(
    `/admin/${resource}/${id}`
  )
  return result(data, error)
}
