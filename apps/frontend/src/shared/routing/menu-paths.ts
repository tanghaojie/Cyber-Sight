import type { NavigationMenu } from '@scaffold/api-contract'

function normalizeAbsolutePath(path: string): string {
  const segments = path.split('/').filter(Boolean)
  return segments.length ? `/${segments.join('/')}` : '/'
}

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
