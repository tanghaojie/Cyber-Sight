import { describe, expect, it } from 'vitest'
import type { NavigationMenu } from '@scaffold/api-contract'
import { resolveMenuPath, resolveNavigationPaths } from './menu-paths.js'

describe('menu path resolution', () => {
  it('joins relative paths and preserves absolute overrides', () => {
    expect(resolveMenuPath('settings', '/system')).toBe('/system/settings')
    expect(resolveMenuPath('/members', '/system')).toBe('/members')
    expect(resolveMenuPath('users')).toBe('')
  })

  it('resolves a navigation tree without changing button targets', () => {
    const nodes: NavigationMenu[] = [
      {
        id: 1,
        parentId: 0,
        name: '系统',
        code: 'SYSTEM',
        icon: 'settings',
        sortOrder: 1,
        type: 'directory',
        path: '/system',
        component: '',
        layout: '',
        externalUrl: '',
        children: [
          {
            id: 2,
            parentId: 1,
            name: '用户',
            code: 'USERS',
            icon: 'users',
            sortOrder: 1,
            type: 'menu',
            path: 'users',
            component: 'users',
            layout: '',
            externalUrl: '',
            children: [],
          },
        ],
      },
    ]

    expect(resolveNavigationPaths(nodes)[0].children[0].path).toBe('/system/users')
  })
})
