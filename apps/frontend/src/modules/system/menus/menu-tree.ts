import type { EntityId, MenuSummary } from '@cyber-ai-forge/api-contract'

export type MenuTreeRecord = MenuSummary & { children: MenuTreeRecord[] }

/** 把后台全量扁平记录按稳定顺序组装成 Element Plus 表格消费的树。 */
export function buildMenuTree(records: MenuSummary[]): MenuTreeRecord[] {
  const ordered = [...records].sort(
    (left, right) => left.sortOrder - right.sortOrder || left.id.localeCompare(right.id),
  )
  const nodes = new Map<EntityId, MenuTreeRecord>(
    ordered.map((record) => [record.id, { ...record, children: [] }]),
  )
  const roots: MenuTreeRecord[] = []
  for (const record of ordered) {
    const node = nodes.get(record.id)!
    const parent = record.parentId === null ? undefined : nodes.get(record.parentId)
    if (parent && parent.type === 'directory' && parent.id !== node.id) {
      parent.children.push(node)
    } else {
      // 缺失父级、父级非目录或自指记录降级为根节点，保证其余数据仍可管理。
      roots.push(node)
    }
  }
  return roots
}
