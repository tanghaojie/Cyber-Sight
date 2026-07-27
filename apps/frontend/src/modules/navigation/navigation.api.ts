import type { NavigationMenuResponse } from '@scaffold/api-contract'
import { apiClient } from '../../api/client.js'

export async function fetchNavigation() {
  const { data, error } = await apiClient.GET<NavigationMenuResponse>('/navigation/menus')
  const response = data ?? error
  if (!response || response.status !== 0 || !('data' in response)) {
    throw new Error(response && 'err' in response ? response.err : '导航配置加载失败')
  }
  return response.data
}
