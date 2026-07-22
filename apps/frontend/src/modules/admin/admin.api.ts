import type { components } from '@scaffold/openapi-spec'
import { apiClient } from '../../api/client.js'

export type ResourceKind = 'users' | 'roles' | 'menus' | 'dictionaries'
export type UserRecord = components['schemas']['UserSummary']
export type RoleRecord = components['schemas']['RoleSummary']
export type MenuRecord = components['schemas']['MenuSummary']
export type DictionaryRecord = components['schemas']['DictionarySummary']
export type AdminRecord = UserRecord | RoleRecord | MenuRecord | DictionaryRecord
type UserCreate = components['schemas']['UserCreateRequest']
type UserUpdate = components['schemas']['UserUpdateRequest']
type RoleRequest = components['schemas']['RoleRequest']
type MenuRequest = components['schemas']['MenuRequest']
type DictionaryRequest = components['schemas']['DictionaryRequest']

export interface PageResult {
  status: number
  list: AdminRecord[]
  total: number
  err?: string
}

export interface MutationResult {
  status: number
  err?: string
}

export async function listResource(
  resource: ResourceKind,
  pageNum: number,
  pageSize: number,
  keyword: string
): Promise<PageResult> {
  const params = { query: { pageNum, pageSize, ...(keyword ? { keyword } : {}) } }
  if (resource === 'users') {
    const { data, error } = await apiClient.GET('/admin/users', { params })
    return (data ?? error) as PageResult
  }
  if (resource === 'roles') {
    const { data, error } = await apiClient.GET('/admin/roles', { params })
    return (data ?? error) as PageResult
  }
  if (resource === 'menus') {
    const { data, error } = await apiClient.GET('/admin/menus', { params })
    return (data ?? error) as PageResult
  }
  const { data, error } = await apiClient.GET('/admin/dictionaries', { params })
  return (data ?? error) as PageResult
}

export async function createResource(
  resource: ResourceKind,
  payload: Record<string, unknown>
): Promise<MutationResult> {
  if (resource === 'users') {
    const { data, error } = await apiClient.POST('/admin/users', { body: payload as UserCreate })
    return (data ?? error) as MutationResult
  }
  if (resource === 'roles') {
    const { data, error } = await apiClient.POST('/admin/roles', { body: payload as RoleRequest })
    return (data ?? error) as MutationResult
  }
  if (resource === 'menus') {
    const { data, error } = await apiClient.POST('/admin/menus', { body: payload as MenuRequest })
    return (data ?? error) as MutationResult
  }
  const { data, error } = await apiClient.POST('/admin/dictionaries', { body: payload as DictionaryRequest })
  return (data ?? error) as MutationResult
}

export async function updateResource(
  resource: ResourceKind,
  id: number,
  payload: Record<string, unknown>
): Promise<MutationResult> {
  const params = { path: { id } }
  if (resource === 'users') {
    const { data, error } = await apiClient.PUT('/admin/users/{id}', { params, body: payload as UserUpdate })
    return (data ?? error) as MutationResult
  }
  if (resource === 'roles') {
    const { data, error } = await apiClient.PUT('/admin/roles/{id}', { params, body: payload as RoleRequest })
    return (data ?? error) as MutationResult
  }
  if (resource === 'menus') {
    const { data, error } = await apiClient.PUT('/admin/menus/{id}', { params, body: payload as MenuRequest })
    return (data ?? error) as MutationResult
  }
  const { data, error } = await apiClient.PUT('/admin/dictionaries/{id}', { params, body: payload as DictionaryRequest })
  return (data ?? error) as MutationResult
}

export async function deleteResource(resource: ResourceKind, id: number): Promise<MutationResult> {
  const params = { path: { id } }
  if (resource === 'users') {
    const { data, error } = await apiClient.DELETE('/admin/users/{id}', { params })
    return (data ?? error) as MutationResult
  }
  if (resource === 'roles') {
    const { data, error } = await apiClient.DELETE('/admin/roles/{id}', { params })
    return (data ?? error) as MutationResult
  }
  if (resource === 'menus') {
    const { data, error } = await apiClient.DELETE('/admin/menus/{id}', { params })
    return (data ?? error) as MutationResult
  }
  const { data, error } = await apiClient.DELETE('/admin/dictionaries/{id}', { params })
  return (data ?? error) as MutationResult
}
