import type { RouteComponent } from 'vue-router'
import { homePage } from '../modules/home/index.js'
import { usersPage } from '../modules/users/index.js'
import { rolesPage } from '../modules/roles/index.js'
import { menusPage } from '../modules/menus/index.js'
import { dictionariesPage } from '../modules/dictionaries/index.js'

export const viewRegistry: Readonly<Record<string, RouteComponent>> = Object.freeze({
  home: homePage,
  users: usersPage,
  roles: rolesPage,
  menus: menusPage,
  dictionaries: dictionariesPage,
})
