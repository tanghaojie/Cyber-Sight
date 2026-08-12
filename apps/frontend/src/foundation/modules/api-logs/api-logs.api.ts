import type { ApiLogItem, ApiLogQuery, PaginatedResponse } from '@cyber-ai-forge/api-contract'
import { apiClient } from '@/foundation/api/client'
import { pageResult } from '@/foundation/api/result'

/** 接口日志模块只暴露脱敏分页查询，页面不直接访问通用 HTTP Client。 */
export async function listApiLogs(query: ApiLogQuery): Promise<PaginatedResponse<ApiLogItem>> {
  const { data, error } = await apiClient.GET<PaginatedResponse<ApiLogItem>>('/admin/api-logs', {
    query,
  })
  return pageResult(data, error)
}
