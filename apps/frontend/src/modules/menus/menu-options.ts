import { buildMenuTreeOptions, type MenuTreeOption } from './menu-tree'
import { listAllMenus } from './menus.api'

export type { MenuTreeOption }

export async function listMenuTreeOptions(): Promise<MenuTreeOption[]> {
  return buildMenuTreeOptions(await listAllMenus())
}
