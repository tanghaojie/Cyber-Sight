import type { NavigationMenuResponse } from '@scaffold/api-contract'
import { apiClient } from '@/api/client'

/** 获取后端按当前用户权限过滤过的菜单树；非法业务响应直接中止路由安装。 */
export async function fetchNavigation() {
  const { data, error } = await apiClient.GET<NavigationMenuResponse>('/navigation/menus')
  const response = data ?? error
  if (!response || response.status !== 0 || !('data' in response)) {
    throw new Error(response && 'err' in response ? response.err : '导航配置加载失败')
  }
  return response.data
}
