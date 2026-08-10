import type { NavigationMenu } from '@cyber-ai-forge/api-contract'

function normalizeAbsolutePath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  return segments.length ? `/${segments.join('/')}` : '/'
}

/** 把数据库菜单中的绝对/相对路径解析为侧栏和 Router 共用的绝对地址。 */
export function resolveMenuPath(path: string, parentPath = ''): string {
  const value = path.trim()
  if (!value) {
    return parentPath
  }
  if (value.startsWith('/')) {
    return normalizeAbsolutePath(value)
  }
  if (!parentPath.startsWith('/')) {
    return ''
  }
  return normalizeAbsolutePath(`${parentPath}/${value}`)
}

export function resolveNavigationPaths(nodes: NavigationMenu[], parentPath = ''): NavigationMenu[] {
  // 目录的新绝对路径成为子节点基准；页面和按钮不会改变同级路径上下文。
  return nodes.map(function resolveNode(node) {
    const path = node.type === 'button' ? node.path : resolveMenuPath(node.path, parentPath)
    const childParentPath = node.type === 'directory' ? path : parentPath
    return {
      ...node,
      path,
      children: resolveNavigationPaths(node.children, childParentPath),
    }
  })
}
