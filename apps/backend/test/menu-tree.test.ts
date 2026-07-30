import { describe, expect, it } from 'vitest'
import { buildNavigationTree } from '@/modules/menus/menus.repository.js'

const rows = [
  {
    id: 1,
    parentId: 0,
    name: '组织与权限',
    icon: 'layers',
    sortOrder: 10,
    type: 'directory' as const,
    path: '',
    component: '',
    layout: 'AdminLayout',
    externalUrl: '',
  },
  {
    id: 2,
    parentId: 1,
    name: '用户管理',
    icon: 'users',
    sortOrder: 10,
    type: 'menu' as const,
    path: '/users',
    component: 'users',
    layout: '',
    externalUrl: '',
  },
  {
    id: 3,
    parentId: 1,
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
    expect(tree[0].children.map((item) => item.id)).toEqual([2, 3])
  })

  it('includes an assigned menu ancestor directory', () => {
    const tree = buildNavigationTree(rows, new Set([2]))
    expect(tree).toHaveLength(1)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children.map((item) => item.id)).toEqual([2])
  })

  it('promotes a cyclic node instead of recursing forever', () => {
    const cyclic = [{ ...rows[0], parentId: 1 }]
    expect(buildNavigationTree(cyclic)[0].id).toBe(1)
  })

  it('keeps legacy invalid records out of executable navigation', () => {
    const legacyRows = [
      ...rows,
      { ...rows[1], id: 4, component: '' },
      { ...rows[2], id: 5, externalUrl: '' },
    ]

    const tree = buildNavigationTree(legacyRows)

    expect(tree[0].children.map((item) => item.id)).toEqual([2, 3])
  })
})
