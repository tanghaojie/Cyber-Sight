import { describe, expect, it } from 'vitest'
import {
  DepartmentRequestSchema,
  EntityIdSchema,
  IdParamsSchema,
  MenuRequestSchema,
} from '@cyber-ai-forge/api-contract'

const entityId = '0198f31a-0000-7000-8000-000000000001'

describe('UUID entity identifier contract', () => {
  it('accepts UUID strings and rejects numeric, nil, and arbitrary identifiers', () => {
    expect(EntityIdSchema.safeParse(entityId).success).toBe(true)
    expect(EntityIdSchema.safeParse(1).success).toBe(false)
    expect(EntityIdSchema.safeParse('1').success).toBe(false)
    expect(EntityIdSchema.safeParse('00000000-0000-0000-0000-000000000000').success).toBe(false)
    expect(EntityIdSchema.safeParse('not-an-id').success).toBe(false)
  })

  it('uses the same runtime UUID validation for path parameters', () => {
    expect(IdParamsSchema.safeParse({ id: entityId }).success).toBe(true)
    expect(IdParamsSchema.safeParse({ id: '42' }).success).toBe(false)
    expect(IdParamsSchema.safeParse({ id: 42 }).success).toBe(false)
  })

  it('represents department and menu roots only with null', () => {
    expect(
      DepartmentRequestSchema.safeParse({
        parentId: null,
        name: 'Root',
        sortOrder: 0,
        enabled: true,
      }).success,
    ).toBe(true)
    expect(
      DepartmentRequestSchema.safeParse({
        parentId: 0,
        name: 'Root',
        sortOrder: 0,
        enabled: true,
      }).success,
    ).toBe(false)
    expect(
      MenuRequestSchema.safeParse({
        parentId: null,
        name: 'Root',
        path: '/root',
        component: '',
        layout: 'AdminLayout',
        externalUrl: '',
        icon: 'layers',
        sortOrder: 0,
        type: 'directory',
        enabled: true,
      }).success,
    ).toBe(true)
  })
})
