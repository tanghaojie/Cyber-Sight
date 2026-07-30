import { z } from 'zod'
import { AuditFieldsSchema, ErrorResponseSchema, paginatedResponseSchema } from '@/shared/http.js'

const integerArray = z.array(z.number().int().min(1))

function validateDepartments(
  input: { departmentIds: number[]; primaryDepartmentId: number; roleIds: number[] },
  context: z.RefinementCtx,
): void {
  if (!input.departmentIds.includes(input.primaryDepartmentId)) {
    context.addIssue({
      code: 'custom',
      path: ['primaryDepartmentId'],
      message: 'Primary department must be included in department IDs',
    })
  }
  if (new Set(input.departmentIds).size !== input.departmentIds.length) {
    context.addIssue({
      code: 'custom',
      path: ['departmentIds'],
      message: 'Department IDs must be unique',
    })
  }
  if (new Set(input.roleIds).size !== input.roleIds.length) {
    context.addIssue({
      code: 'custom',
      path: ['roleIds'],
      message: 'Role IDs must be unique',
    })
  }
}

export const UserSummarySchema = AuditFieldsSchema.extend({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string(),
  email: z.email(),
  enabled: z.boolean(),
  roleIds: integerArray,
  departmentIds: integerArray,
  primaryDepartmentId: z.number().int().min(1),
  lastLoginAt: z.iso.datetime().nullable().optional(),
})

export const UserCreateSchema = z
  .strictObject({
    username: z.string().min(2).max(50),
    displayName: z.string().min(1).max(80),
    email: z.email(),
    password: z.string().min(8).max(128),
    enabled: z.boolean(),
    roleIds: integerArray,
    departmentIds: integerArray.min(1),
    primaryDepartmentId: z.number().int().min(1),
  })
  .superRefine(validateDepartments)

export const UserUpdateSchema = z
  .strictObject({
    displayName: z.string().min(1).max(80),
    email: z.email(),
    password: z.string().min(8).max(128).optional(),
    enabled: z.boolean(),
    roleIds: integerArray,
    departmentIds: integerArray.min(1),
    primaryDepartmentId: z.number().int().min(1),
  })
  .superRefine(validateDepartments)

export const UserPageResponseSchema = paginatedResponseSchema(UserSummarySchema)
export const UserPageResultSchema = z.union([UserPageResponseSchema, ErrorResponseSchema])

export type UserSummary = z.infer<typeof UserSummarySchema>
export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type UserPageResponse = z.infer<typeof UserPageResponseSchema>
export type UserPageResult = z.infer<typeof UserPageResultSchema>
