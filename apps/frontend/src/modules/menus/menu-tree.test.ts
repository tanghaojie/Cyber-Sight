import { describe, expect, it } from 'vitest'
import type { MenuSummary } from '@scaffold/api-contract'
import { buildMenuTree, buildMenuTreeOptions } from './menu-tree.js'

const audit = {
  isDeleted: false,
  createdAt: '2026-07-27T00:00:00.000Z',
  createdBy: 1,
  updatedAt: '2026-07-27T00:00:00.000Z',
  updatedBy: 1,
}
const records: MenuSummary[] = [
  {
    ...audit,
    id: 2,
    parentId: 1,
    name: '用户管理',
    code: 'USERS',
    path: '/users',
    component: 'users',
    layout: '',
    externalUrl: '',
    icon: 'users',
    sortOrder: 10,
    type: 'menu',
    enabled: true,
  },
  {
    ...audit,
    id: 1,
    parentId: 0,
    name: '组织与权限',
    code: 'ORGANIZATION',
    path: '',
    component: '',
    layout: 'AdminLayout',
    externalUrl: '',
    icon: 'layers',
    sortOrder: 5,
    type: 'directory',
    enabled: true,
  },
]

describe('menu management tree', () => {
  it('nests records under directory parents', () => {
    const tree = buildMenuTree(records)
    expect(tree[0].id).toBe(1)
    expect(tree[0].children[0].id).toBe(2)
  })

  it('converts records into Element Plus tree options', () => {
    expect(buildMenuTreeOptions(records)).toEqual([
      { value: 1, label: '组织与权限', children: [{ value: 2, label: '用户管理' }] },
    ])
  })
})
