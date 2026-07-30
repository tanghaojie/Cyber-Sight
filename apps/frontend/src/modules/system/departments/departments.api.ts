import type {
  DepartmentListResponse,
  DepartmentOption,
  DepartmentOptionListResponse,
  DepartmentRequest,
  DepartmentSummary,
  EmptySuccessResponse,
  IdResponse,
} from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, type ApiMutationResult } from '@/api/result'

// 部门模块的列表/选项接口必须返回 data，缺失时直接抛错交给页面空态处理。
function dataOrThrow<T>(
  result: { status: number; data?: T; err?: string } | undefined,
  message: string,
): T {
  if (!result || result.status !== 0 || result.data === undefined) {
    throw new Error(result?.err || message)
  }
  return result.data
}

export async function listDepartments(): Promise<DepartmentSummary[]> {
  const { data, error } = await apiClient.GET<DepartmentListResponse>('/admin/departments')
  return dataOrThrow(data ?? error, '部门加载失败')
}

export async function listDepartmentOptions(): Promise<DepartmentOption[]> {
  const { data, error } = await apiClient.GET<DepartmentOptionListResponse>(
    '/admin/departments/options',
  )
  return dataOrThrow(data ?? error, '部门选项加载失败')
}

export async function createDepartment(payload: DepartmentRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, DepartmentRequest>(
    '/admin/departments',
    { body: payload },
  )
  return apiResult(data, error)
}

export async function updateDepartment(
  id: number,
  payload: DepartmentRequest,
): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, DepartmentRequest>(
    `/admin/departments/${id}`,
    { body: payload },
  )
  return apiResult(data, error)
}

export async function deleteDepartment(id: number) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/departments/${id}`)
  return apiResult(data, error)
}
