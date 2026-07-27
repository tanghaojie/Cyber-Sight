function configuredValue(value: string | undefined, fallback: string): string {
  const normalized = value?.trim()
  return normalized || fallback
}

export const appConfig = Object.freeze({
  name: configuredValue(import.meta.env.VITE_APP_NAME, 'JTLab'),
  fullName: configuredValue(import.meta.env.VITE_APP_FULL_NAME, '桀士实验室'),
  tagline: configuredValue(import.meta.env.VITE_APP_TAGLINE, 'Ideas, engineered.'),
  productLabel: configuredValue(import.meta.env.VITE_APP_PRODUCT_LABEL, 'LAB CONTROL'),
  primaryColor: '#70CFA2',
})

export const viewComponentOptions = Object.freeze([
  { value: 'home', label: '工作台总览' },
  { value: 'users', label: '用户管理' },
  { value: 'roles', label: '角色管理' },
  { value: 'menus', label: '菜单管理' },
  { value: 'dictionaries', label: '字典管理' },
])

export function brandInitials(name = appConfig.name): string {
  return (
    name
      .replace(/[^a-z0-9]/gi, '')
      .slice(0, 2)
      .toUpperCase() || 'JT'
  )
}
