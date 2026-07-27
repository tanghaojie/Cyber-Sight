import type { MenuSummary } from '@scaffold/api-contract'

export type MenuTreeRecord = MenuSummary & { children: MenuTreeRecord[] }
export interface MenuTreeOption { value: number; label: string; children?: MenuTreeOption[] }

export function buildMenuTree(records: MenuSummary[]): MenuTreeRecord[] {
  const ordered = [...records].sort((left, right) => left.sortOrder - right.sortOrder || left.id - right.id)
  const nodes = new Map<number, MenuTreeRecord>(ordered.map((record) => [record.id, { ...record, children: [] }]))
  const roots: MenuTreeRecord[] = []
  for (const record of ordered) {
    const node = nodes.get(record.id)!
    const parent = nodes.get(record.parentId)
    if (parent && parent.type === 'directory' && parent.id !== node.id) parent.children.push(node)
    else roots.push(node)
  }
  return roots
}

function toOption(node: MenuTreeRecord): MenuTreeOption {
  return { value: node.id, label: node.name, ...(node.children.length ? { children: node.children.map(toOption) } : {}) }
}

export function buildMenuTreeOptions(records: MenuSummary[]): MenuTreeOption[] {
  return buildMenuTree(records).map(toOption)
}
