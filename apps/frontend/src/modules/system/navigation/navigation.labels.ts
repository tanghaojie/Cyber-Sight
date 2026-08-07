import type { NavigationMenu } from '@scaffold/api-contract'
import type { LocalizedLabel } from '@/modules/system/localization/localization'

interface DefaultNavigationFingerprint {
  type: NavigationMenu['type']
  path: string
  component: string
  name: string
  key: string
}

const defaultNavigationFingerprints: readonly DefaultNavigationFingerprint[] = [
  {
    type: 'directory',
    path: '/sys',
    component: '',
    name: '组织与权限',
    key: 'navigation.defaultMenus.systemAccess',
  },
  {
    type: 'directory',
    path: '/config',
    component: '',
    name: '系统配置',
    key: 'navigation.defaultMenus.systemConfig',
  },
  {
    type: 'directory',
    path: '/ops',
    component: '',
    name: '运维监控',
    key: 'navigation.defaultMenus.operationsMonitoring',
  },
  {
    type: 'menu',
    path: '/sys/users',
    component: 'users',
    name: '用户管理',
    key: 'navigation.defaultMenus.users',
  },
  {
    type: 'menu',
    path: '/sys/roles',
    component: 'roles',
    name: '角色管理',
    key: 'navigation.defaultMenus.roles',
  },
  {
    type: 'menu',
    path: '/sys/departments',
    component: 'departments',
    name: '部门管理',
    key: 'navigation.defaultMenus.departments',
  },
  {
    type: 'menu',
    path: '/sys/positions',
    component: 'positions',
    name: '岗位管理',
    key: 'navigation.defaultMenus.positions',
  },
  {
    type: 'menu',
    path: '/sys/menus',
    component: 'menus',
    name: '菜单管理',
    key: 'navigation.defaultMenus.menus',
  },
  {
    type: 'menu',
    path: '/config/dictionaries',
    component: 'dictionaries',
    name: '字典管理',
    key: 'navigation.defaultMenus.dictionaries',
  },
  {
    type: 'menu',
    path: '/ops/api-logs',
    component: 'api-logs',
    name: '接口日志',
    key: 'navigation.defaultMenus.apiLogs',
  },
  {
    type: 'menu',
    path: '/about',
    component: 'about',
    name: '关于项目',
    key: 'navigation.defaultMenus.about',
  },
]

/**
 * 只有完整匹配初始菜单的节点才使用系统翻译；任一用户修改都会回退数据库原始名称。
 */
export function navigationLabel(item: NavigationMenu): LocalizedLabel {
  const fingerprint = defaultNavigationFingerprints.find(
    (candidate) =>
      candidate.type === item.type &&
      candidate.path === item.path &&
      candidate.component === item.component &&
      candidate.name === item.name,
  )

  return {
    ...(fingerprint ? { key: fingerprint.key } : {}),
    fallback: item.name,
  }
}
