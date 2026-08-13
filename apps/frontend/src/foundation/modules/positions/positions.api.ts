import type {
  EmptySuccessResponse,
  EntityId,
  IdResponse,
  PaginatedResponse,
  PositionOption,
  PositionOptionListResponse,
  PositionRequest,
  PositionSummary,
} from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/foundation/api/client'
import { apiResult, pageResult, type ApiMutationResult } from '@/foundation/api/result'
import { translate } from '@/foundation/modules/localization/localization'

export type { PositionOption } from '@cyber-ai-forge/api-contract'

export async function listPositions(
  pageNum: number,
  pageSize: number,
  keyword = '',
  departmentId?: EntityId,
) {
  const { data, error } = await apiClient.GET<PaginatedResponse<PositionSummary>>(
    '/admin/positions',
    {
      query: {
        pageNum,
        pageSize,
        ...(keyword ? { keyword } : {}),
        ...(departmentId ? { departmentId } : {}),
      },
    },
  )
  return pageResult(data, error)
}

export async function listPositionOptions(): Promise<PositionOption[]> {
  const { data, error } = await apiClient.GET<PositionOptionListResponse>(
    '/admin/positions/options',
  )
  const result = data ?? error
  if (!result || result.status !== 0 || !('data' in result) || result.data === undefined) {
    throw new Error(translate('positions.errors.optionsLoadFailed'))
  }
  return result.data
}

export async function createPosition(payload: PositionRequest): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.POST<IdResponse, PositionRequest>('/admin/positions', {
    body: payload,
  })
  return apiResult(data, error)
}

export async function updatePosition(
  id: EntityId,
  payload: PositionRequest,
): Promise<ApiMutationResult> {
  const { data, error } = await apiClient.PUT<IdResponse, PositionRequest>(
    `/admin/positions/${id}`,
    { body: payload },
  )
  return apiResult(data, error)
}

export async function deletePosition(id: EntityId) {
  const { data, error } = await apiClient.DELETE<EmptySuccessResponse>(`/admin/positions/${id}`)
  return apiResult(data, error)
}
