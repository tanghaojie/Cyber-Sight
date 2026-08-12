import type {
  AuthorizationSubjectType,
  DataResourceListResponse,
  EntityId,
  PermissionListResponse,
  SubjectAccessRequest,
  SubjectAccessResponse,
  IdResponse,
} from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/foundation/api/client'
import { apiResult, type ApiMutationResult } from '@/foundation/api/result'
import { translate } from '@/foundation/modules/localization/localization'

// 授权 API 把权限/资源目录查询和三类主体的访问配置读写集中在同一公共文件。
function responseData<T>(
  response: { status: number; data?: T; err?: string },
  fallback: string,
): T {
  if (response.status !== 0 || response.data === undefined) {
    throw new Error(translate(fallback))
  }
  return response.data
}

export async function listAuthorizationPermissions() {
  const { data, error } = await apiClient.GET<PermissionListResponse>(
    '/admin/authorization/permissions',
  )
  return responseData(data ?? error ?? { status: -1 }, 'authorization.errors.permissionsLoadFailed')
}

export async function listDataResources() {
  const { data, error } = await apiClient.GET<DataResourceListResponse>(
    '/admin/authorization/data-resources',
  )
  return responseData(data ?? error ?? { status: -1 }, 'authorization.errors.resourcesLoadFailed')
}

export async function getSubjectAccess(
  subjectType: AuthorizationSubjectType,
  id: EntityId,
): Promise<SubjectAccessRequest> {
  // subjectType 只来自共享枚举，可安全映射到后端约定的复数路径。
  const { data, error } = await apiClient.GET<SubjectAccessResponse>(
    `/admin/authorization/${subjectType}s/${id}`,
  )
  return responseData(data ?? error ?? { status: -1 }, 'authorization.errors.accessLoadFailed')
}

export async function replaceSubjectAccess(
  subjectType: AuthorizationSubjectType,
  id: EntityId,
  payload: SubjectAccessRequest,
): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, SubjectAccessRequest>(
    `/admin/authorization/${subjectType}s/${id}`,
    { body: payload },
  )
  return apiResult(data, error)
}
