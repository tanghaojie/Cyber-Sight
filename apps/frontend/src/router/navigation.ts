export interface NavigationItem {
  to: string
  label: string
  description: string
  icon: string
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: '工作台',
    items: [
      {
        to: '/',
        label: '总览',
        description: '系统运行与快捷入口',
        icon: 'home',
      },
    ],
  },
  {
    label: '组织与权限',
    items: [
      {
        to: '/users',
        label: '用户管理',
        description: '账号与身份资料',
        icon: 'users',
      },
      {
        to: '/roles',
        label: '角色管理',
        description: '职责与菜单授权',
        icon: 'shield',
      },
      {
        to: '/menus',
        label: '菜单管理',
        description: '导航与页面入口',
        icon: 'menu',
      },
    ],
  },
  {
    label: '系统配置',
    items: [
      {
        to: '/dictionaries',
        label: '字典管理',
        description: '通用枚举与展示值',
        icon: 'book',
      },
    ],
  },
]
