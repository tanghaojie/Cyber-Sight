import type { DataResourceDefinition, DataScopeType } from '@scaffold/api-contract'

export const authorizationPermissionKeys = {
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
