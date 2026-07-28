import { createMemoryHistory, createRouter, type RouteComponent } from 'vue-router'
import { describe, expect, it } from 'vitest'
import type { NavigationMenu } from '@scaffold/api-contract'
import router, { clearDynamicRoutes, installMenuRoutes } from './index.js'

const adminLayout: RouteComponent = { template: '<router-view />' }
const directoryLayout: RouteComponent = { template: '<router-view />' }
const menuLayout: RouteComponent = { template: '<router-view />' }
const usersView: RouteComponent = { template: '<p>users</p>' }

function menu(
  id: number,
  path: string,
  component: string,
  layout = '',
): NavigationMenu {
  return {
    id,
    parentId: 0,
    name: `菜单 ${id}`,
    code: `MENU_${id}`,
    icon: 'menu',
    sortOrder: id,
    type: 'menu',
    path,
    component,
    layout,
    externalUrl: '',
    children: [],
  }
}

function targetRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/',
        name: 'admin-root',
        component: { template: '<router-view />' },
        children: [],
      },
    ],
  })
}

const registries = {
  layouts: { AdminLayout: adminLayout, DirectoryLayout: directoryLayout, MenuLayout: menuLayout },
  views: { users: usersView },
}

describe('database dynamic routes', () => {
  it('inherits directory layouts, allows menu overrides and falls back to the default', () => {
    const target = targetRouter()
    const inheritedMenu = { ...menu(2, '/users', 'users'), parentId: 1 }
    const overriddenMenu = { ...menu(3, '/custom', 'users', 'MenuLayout'), parentId: 1 }
    const nodes: NavigationMenu[] = [
      {
        id: 1,
        parentId: 0,
        name: '目录',
        code: 'DIRECTORY',
        icon: 'layers',
        sortOrder: 1,
        type: 'directory',
        path: '',
        component: '',
        layout: 'DirectoryLayout',
        externalUrl: '',
        children: [inheritedMenu, overriddenMenu],
      },
      menu(4, '/default', 'users'),
      menu(5, '/', 'users'),
    ]

    expect(installMenuRoutes(target, nodes, registries)).toBe(4)
    expect(target.resolve('/users').matched[1].components?.default).toBe(directoryLayout)
    expect(target.resolve('/custom').matched[1].components?.default).toBe(menuLayout)
    expect(target.resolve('/default').matched[1].components?.default).toBe(adminLayout)
    expect(target.resolve('/').name).toBe('menu-5')
    expect(target.resolve('/users').name).toBe('menu-2')
    clearDynamicRoutes()
  })

  it('ignores unknown page and explicit layout identifiers', () => {
    const target = targetRouter()
    const nodes = [
      menu(1, '/users', 'users'),
      menu(2, '/unknown-view', 'arbitrary-script'),
      menu(3, '/unknown-layout', 'users', 'ArbitraryLayout'),
    ]

    expect(installMenuRoutes(target, nodes, registries)).toBe(1)
    expect(target.resolve('/users').name).toBe('menu-1')
    expect(target.resolve('/unknown-view').matched).toHaveLength(0)
    expect(target.resolve('/unknown-layout').matched).toHaveLength(0)
    clearDynamicRoutes()
  })

  it('matches a direct dynamic URL with the protected startup fallback', () => {
    expect(router.resolve('/menus').name).toBe('dynamic-fallback')
  })
})
