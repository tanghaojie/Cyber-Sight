import { describe, expect, it } from 'vitest'
import {
  isValidMenuPath,
  MenuListResponseSchema,
  MenuRequestSchema,
} from '@scaffold/api-contract'

const auditFields = {
  isDeleted: false,
  createdAt: '2026-07-27T00:00:00.000Z',
  createdBy: 1,
  updatedAt: '2026-07-27T00:00:00.000Z',
  updatedBy: 1,
}

describe('legacy menu response compatibility', () => {
  it('reads an old invalid button so an administrator can repair it', () => {
    const legacyButton = {
      id: 6,
      parentId: 0,
      name: 'test',
      code: 'test',
      path: '/qqqq',
      component: '',
      externalUrl: '',
      icon: '',
      sortOrder: 0,
      type: 'button',
      enabled: true,
      ...auditFields,
    }

    const parsed = MenuListResponseSchema.safeParse({ status: 0, data: [legacyButton] })
    expect(parsed.success).toBe(true)
    if (parsed.success) expect(parsed.data.data?.[0].layout).toBe('')
    expect(MenuRequestSchema.safeParse(legacyButton).success).toBe(false)
  })

  it('accepts layouts for directories and menus but not external buttons', () => {
    const common = {
      parentId: 0,
      name: '测试',
      code: 'TEST_MENU',
      icon: '',
      sortOrder: 0,
      enabled: true,
    }
    expect(MenuRequestSchema.safeParse({
      ...common,
      type: 'directory',
      path: '/administration',
      component: '',
      layout: 'AdminLayout',
      externalUrl: '',
    }).success).toBe(true)
    expect(MenuRequestSchema.safeParse({
      ...common,
      type: 'menu',
      parentId: 1,
      path: 'test',
      component: 'test',
      layout: 'AdminLayout',
      externalUrl: '',
    }).success).toBe(true)
    expect(MenuRequestSchema.safeParse({
      ...common,
      type: 'button',
      path: '',
      component: '',
      layout: 'AdminLayout',
      externalUrl: 'https://example.com',
    }).success).toBe(false)
  })

  it('requires absolute root paths and allows relative descendant paths', () => {
    expect(isValidMenuPath({ type: 'directory', parentId: 0, path: '/system' })).toBe(true)
    expect(isValidMenuPath({ type: 'menu', parentId: 0, path: 'users' })).toBe(false)
    expect(isValidMenuPath({ type: 'menu', parentId: 1, path: 'users' })).toBe(true)
    expect(isValidMenuPath({ type: 'menu', parentId: 1, path: '/users' })).toBe(true)
    expect(isValidMenuPath({ type: 'button', parentId: 0, path: '' })).toBe(true)
  })
})
