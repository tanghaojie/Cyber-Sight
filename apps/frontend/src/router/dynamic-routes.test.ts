import { createMemoryHistory, createRouter } from 'vue-router'
import { describe, expect, it } from 'vitest'
import type { NavigationMenu } from '@scaffold/api-contract'
import { clearDynamicRoutes, installMenuRoutes } from './index.js'

describe('database dynamic routes', () => {
  it('registers known view components and ignores unknown identifiers', () => {
    const target = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', name: 'admin-root', component: { template: '<router-view />' }, children: [] }],
    })
    const nodes: NavigationMenu[] = [
      { id: 1, parentId: 0, name: '用户管理', code: 'USERS', icon: 'users', sortOrder: 1, type: 'menu', path: '/users', component: 'users', externalUrl: '', children: [] },
      { id: 2, parentId: 0, name: '未知页面', code: 'UNKNOWN', icon: 'menu', sortOrder: 2, type: 'menu', path: '/unknown', component: 'arbitrary-script', externalUrl: '', children: [] },
    ]
    expect(installMenuRoutes(target, nodes)).toBe(1)
    expect(target.resolve('/users').name).toBe('menu-1')
    expect(target.resolve('/unknown').matched).toHaveLength(0)
    clearDynamicRoutes()
  })
})
