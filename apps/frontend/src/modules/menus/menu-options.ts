import { buildMenuTreeOptions, type MenuTreeOption } from './menu-tree.js'
import { listAllMenus } from './menus.api.js'

export type { MenuTreeOption }

export async function listMenuTreeOptions(): Promise<MenuTreeOption[]> {
  return buildMenuTreeOptions(await listAllMenus())
}
