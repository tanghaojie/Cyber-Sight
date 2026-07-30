import type {
  AuthorizationSubjectType,
  DataResourceListResponse,
  PermissionListResponse,
  SubjectAccessRequest,
  SubjectAccessResponse,
  IdResponse,
} from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { apiResult, type ApiMutationResult } from '@/api/result'

// 授权 API 把权限/资源目录查询和三类主体的访问配置读写集中在同一公共文件。
function responseData<T>(
  response: { status: number; data?: T; err?: string },
  fallback: string,
): T {
  if (response.status !== 0 || response.data === undefined) {
    throw new Error(response.err || fallback)
  }
  return response.data
}

export async function listAuthorizationPermissions() {
  const { data, error } = await apiClient.GET<PermissionListResponse>(
    '/admin/authorization/permissions',
  )
  return responseData(data ?? error ?? { status: -1 }, '权限选项加载失败')
}

export async function listDataResources() {
  const { data, error } = await apiClient.GET<DataResourceListResponse>(
    '/admin/authorization/data-resources',
  )
  return responseData(data ?? error ?? { status: -1 }, '数据资源加载失败')
}

export async function getSubjectAccess(
  subjectType: AuthorizationSubjectType,
  id: number,
): Promise<SubjectAccessRequest> {
  // subjectType 只来自共享枚举，可安全映射到后端约定的复数路径。
  const { data, error } = await apiClient.GET<SubjectAccessResponse>(
    `/admin/authorization/${subjectType}s/${id}`,
  )
  return responseData(data ?? error ?? { status: -1 }, '权限配置加载失败')
}

export async function replaceSubjectAccess(
  subjectType: AuthorizationSubjectType,
  id: number,
  payload: SubjectAccessRequest,
): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, SubjectAccessRequest>(
    `/admin/authorization/${subjectType}s/${id}`,
    { body: payload },
  )
  return apiResult(data, error)
}
