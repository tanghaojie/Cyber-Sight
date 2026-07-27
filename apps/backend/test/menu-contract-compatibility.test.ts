import { describe, expect, it } from 'vitest'
import { MenuListResponseSchema, MenuRequestSchema } from '@scaffold/api-contract'

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

    expect(
      MenuListResponseSchema.safeParse({ status: 0, data: [legacyButton] })
        .success
    ).toBe(true)
    expect(MenuRequestSchema.safeParse(legacyButton).success).toBe(false)
  })
})
