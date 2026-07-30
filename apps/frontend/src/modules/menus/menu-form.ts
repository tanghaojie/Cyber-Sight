import { isValidMenuPath, type MenuSummary } from '@scaffold/api-contract'

type MenuType = MenuSummary['type']

/** 与共享契约复用路径层级规则，并把失败原因转换为表单可读中文。 */
export function menuPathError(type: MenuType, parentId: number, path: string): string {
  if (type === 'button') {
    return ''
  }
  if (!path.trim()) {
    return '目录和菜单必须配置站内路由'
  }
  if (!isValidMenuPath({ type, parentId, path })) {
    return '根节点的站内路由必须以 / 开头'
  }
  return ''
}
