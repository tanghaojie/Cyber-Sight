import type { RouteComponent } from 'vue-router'
import { buildMenuTreeOptions, type MenuTreeOption } from './menu-tree.js'
import { listAllMenus } from './menus.api.js'

export const menusPage: RouteComponent = () => import('./pages/MenusPage.vue')
export type { MenuTreeOption }

export async function listMenuTreeOptions(): Promise<MenuTreeOption[]> {
  return buildMenuTreeOptions(await listAllMenus())
}
