import { describe, expect, it } from 'vitest'
import { buildNavigationTree } from '@/modules/system/menus/menus.repository.js'

const rootId = '0198f31a-0000-7000-8000-000000000001'
const userMenuId = '0198f31a-0000-7000-8000-000000000002'
const docsMenuId = '0198f31a-0000-7000-8000-000000000003'

const rows = [
  {
    id: rootId,
    parentId: null,
    name: '组织与权限',
    icon: 'layers',
    sortOrder: 10,
    type: 'directory' as const,
    path: '/sys',
    component: '',
    layout: 'AdminLayout',
    externalUrl: '',
  },
  {
    id: userMenuId,
    parentId: rootId,
    name: '用户管理',
    icon: 'users',
    sortOrder: 10,
    type: 'menu' as const,
    path: 'users',
    component: 'users',
    layout: '',
    externalUrl: '',
  },
  {
    id: docsMenuId,
    parentId: rootId,
    name: '文档',
    icon: 'external',
    sortOrder: 20,
    type: 'button' as const,
    path: '',
    component: '',
    layout: '',
    externalUrl: 'https://example.com',
  },
]

// 菜单树测试同时保护稳定排序、权限祖先补齐、循环降级和遗留坏数据隔离。
describe('navigation menu tree', () => {
  it('builds stable directory children in sort order', () => {
    const tree = buildNavigationTree(rows)
    expect(tree).toHaveLength(1)
    expect(tree[0].children.map((item) => item.id)).toEqual([userMenuId, docsMenuId])
  })

  it('includes an assigned menu ancestor directory', () => {
    const tree = buildNavigationTree(rows, new Set([userMenuId]))
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(rootId)
    expect(tree[0].children.map((item) => item.id)).toEqual([userMenuId])
  })

  it('promotes a cyclic node instead of recursing forever', () => {
    const cyclic = [{ ...rows[0], parentId: rootId }]
    expect(buildNavigationTree(cyclic)[0].id).toBe(rootId)
  })

  it('keeps legacy invalid records out of executable navigation', () => {
    const legacyRows = [
      ...rows,
      { ...rows[1], id: '0198f31a-0000-7000-8000-000000000004', component: '' },
      { ...rows[2], id: '0198f31a-0000-7000-8000-000000000005', externalUrl: '' },
    ]

    const tree = buildNavigationTree(legacyRows)

    expect(tree[0].children.map((item) => item.id)).toEqual([userMenuId, docsMenuId])
  })
})
