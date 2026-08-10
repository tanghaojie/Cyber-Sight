import { isValidMenuPath, type EntityId, type MenuSummary } from '@cyber-ai-forge/api-contract'
import { translate } from '@/modules/system/localization/localization'

type MenuType = MenuSummary['type']

/** 与共享契约复用路径层级规则，并把失败原因转换为当前语言的表单提示。 */
export function menuPathError(type: MenuType, parentId: EntityId | null, path: string): string {
  if (type === 'button') {
    return ''
  }
  if (!path.trim()) {
    return translate('menus.errors.routeRequired')
  }
  if (!isValidMenuPath({ type, parentId, path })) {
    return translate('menus.errors.rootRouteInvalid')
  }
  return ''
}
