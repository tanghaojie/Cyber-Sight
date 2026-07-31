import type { NavigationMenuResponse } from '@scaffold/api-contract'
import { apiClient } from '@/api/client'
import { translate } from '@/modules/system/localization/localization'

/** 获取后端按当前用户权限过滤过的菜单树；非法业务响应直接中止路由安装。 */
export async function fetchNavigation() {
  const { data, error } = await apiClient.GET<NavigationMenuResponse>('/navigation/menus')
  const response = data ?? error
  if (!response || response.status !== 0 || !('data' in response)) {
    throw new Error(translate('navigation.errors.loadFailed'))
  }
  return response.data
}
