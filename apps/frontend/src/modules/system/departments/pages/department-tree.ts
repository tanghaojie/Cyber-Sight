import type { DepartmentSummary } from '@cyber-ai-forge/api-contract'

export interface DepartmentTreeNode extends DepartmentSummary {
  children: DepartmentTreeNode[]
}

export interface DepartmentTreeOption {
  value: number
  label: string
  disabled?: boolean
  children?: DepartmentTreeOption[]
}

function compareDepartments(left: DepartmentSummary, right: DepartmentSummary): number {
  return left.sortOrder - right.sortOrder || left.id - right.id
}

function sortDepartmentTree(nodes: DepartmentTreeNode[]): void {
  nodes.sort(compareDepartments)
  for (const node of nodes) {
    sortDepartmentTree(node.children)
  }
}

/** 把接口的邻接表快照组装为树；缺失父节点的记录提升为根节点，避免管理页面静默丢行。 */
export function buildDepartmentTree(
  records: DepartmentSummary[],
  excludedIds: ReadonlySet<number> = new Set<number>(),
): DepartmentTreeNode[] {
  const nodes = new Map<number, DepartmentTreeNode>()
  for (const record of records) {
    if (!excludedIds.has(record.id)) {
      nodes.set(record.id, { ...record, children: [] })
    }
  }

  const roots: DepartmentTreeNode[] = []
  for (const node of nodes.values()) {
    const parent = node.parentId > 0 ? nodes.get(node.parentId) : undefined
    if (parent && parent.id !== node.id) {
      parent.children.push(node)
    } else {
      roots.push(node)
    }
  }
  sortDepartmentTree(roots)
  return roots
}

/** 搜索保留命中子节点的祖先路径；父节点自身命中时展示其完整子树。 */
export function filterDepartmentTree(
  nodes: DepartmentTreeNode[],
  keyword: string,
): DepartmentTreeNode[] {
  const query = keyword.trim().toLowerCase()
  if (!query) {
    return nodes
  }

  const filtered: DepartmentTreeNode[] = []
  for (const node of nodes) {
    const selfMatches = node.name.toLowerCase().includes(query)
    if (selfMatches) {
      filtered.push(node)
      continue
    }
    const children = filterDepartmentTree(node.children, query)
    if (children.length > 0) {
      filtered.push({ ...node, children })
    }
  }
  return filtered
}

/** 编辑节点不能移动到自身或任一后代；前端先隐藏这些候选，后端仍执行最终闭包校验。 */
export function collectDepartmentSubtreeIds(
  records: DepartmentSummary[],
  rootId: number,
): Set<number> {
  const childrenByParent = new Map<number, number[]>()
  for (const record of records) {
    const children = childrenByParent.get(record.parentId) ?? []
    children.push(record.id)
    childrenByParent.set(record.parentId, children)
  }

  const ids = new Set<number>()
  const pending = [rootId]
  while (pending.length > 0) {
    const currentId = pending.pop()!
    if (ids.has(currentId)) {
      continue
    }
    ids.add(currentId)
    pending.push(...(childrenByParent.get(currentId) ?? []))
  }
  return ids
}

export function toDepartmentTreeOptions(nodes: DepartmentTreeNode[]): DepartmentTreeOption[] {
  return nodes.map(function toOption(node) {
    const children = toDepartmentTreeOptions(node.children)
    return {
      value: node.id,
      label: node.name,
      disabled: !node.enabled,
      ...(children.length > 0 ? { children } : {}),
    }
  })
}
