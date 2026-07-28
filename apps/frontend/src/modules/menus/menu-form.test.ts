import { describe, expect, it } from 'vitest'
import { createInternalMenuCode, menuPathError } from './menu-form.js'

describe('menu form rules', () => {
  it('requires paths for directories and menus', () => {
    expect(menuPathError('directory', 0, '')).toContain('站内路由')
    expect(menuPathError('menu', 1, '')).toContain('站内路由')
    expect(menuPathError('button', 0, '')).toBe('')
  })

  it('requires a leading slash only for root nodes', () => {
    expect(menuPathError('directory', 0, '/system')).toBe('')
    expect(menuPathError('menu', 0, 'users')).toContain('/ 开头')
    expect(menuPathError('menu', 1, 'users')).toBe('')
    expect(menuPathError('menu', 1, '/users')).toBe('')
  })

  it('creates an opaque API-compatible code', () => {
    expect(createInternalMenuCode()).toMatch(/^MENU_[A-Z0-9_]{2,74}$/)
  })
})
