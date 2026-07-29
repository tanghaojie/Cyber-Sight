import { isValidMenuPath, type MenuSummary } from '@scaffold/api-contract'

type MenuType = MenuSummary['type']

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

export function createInternalMenuCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = crypto.randomUUID().replaceAll('-', '').slice(0, 12).toUpperCase()
  return `MENU_${timestamp}_${random}`
}
