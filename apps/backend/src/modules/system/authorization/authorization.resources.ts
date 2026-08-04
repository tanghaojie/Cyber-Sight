import type { DataResourceDefinition, DataScopeType } from '@scaffold/api-contract'

// 功能权限键的代码侧目录，路由和菜单都引用这些稳定值，避免散落字符串。
export const authorizationPermissionKeys = {
  apiLogsRead: 'api_logs.read',
  departmentsManage: 'departments.manage',
  dictionariesManage: 'dictionaries.manage',
  menusManage: 'menus.manage',
  rolesManage: 'roles.manage',
  usersManage: 'users.manage',
} as const

export const dataResourceDefinitions: DataResourceDefinition[] = [
  {
    key: 'users',
    name: '用户数据',
    actions: ['read', 'create', 'update', 'delete'],
    scopeTypes: ['self', 'own_department', 'own_department_tree', 'custom_departments', 'all'],
  },
]

/**
 * 校验数据策略是否属于已登记资源、动作和范围；创建操作不能使用仅表示已有记录的 self。
 */
export function isRegisteredDataPolicy(
  resourceKey: string,
  action: string,
  scopeType?: DataScopeType,
): boolean {
  const resource = dataResourceDefinitions.find((item) => item.key === resourceKey)
  if (!resource?.actions.includes(action)) {
    return false
  }
  if (!scopeType || !resource.scopeTypes.includes(scopeType)) {
    return scopeType === undefined
  }
  return !(action === 'create' && scopeType === 'self')
}
