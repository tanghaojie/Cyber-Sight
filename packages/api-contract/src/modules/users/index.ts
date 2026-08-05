import { z } from 'zod'
import {
  apiResponseSchema,
  AuditFieldsSchema,
  ErrorResponseSchema,
  paginatedResponseSchema,
} from '@/shared/http.js'

/** 用户可关联多个角色和部门，但必须且只能从已关联部门中指定一个主部门。 */
const integerArray = z.array(z.number().int().min(1))

function validateDepartments(
  input: { departmentIds: number[]; primaryDepartmentId: number; roleIds: number[] },
  context: z.RefinementCtx,
): void {
  // 该复合约束由创建和更新 Schema 共用，保证两个写入入口行为一致。
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

/** 当前登录用户可自助维护的资料；不暴露角色、部门或账号管理字段。 */
export const PersonalProfileSchema = z.strictObject({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string(),
  email: z.email(),
})

export const PersonalProfileUpdateSchema = z.strictObject({
  displayName: z.string().min(1).max(80),
  email: z.email(),
})

export const PasswordUpdateSchema = z.strictObject({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
})

export const UserPageResponseSchema = paginatedResponseSchema(UserSummarySchema)
export const UserPageResultSchema = z.union([UserPageResponseSchema, ErrorResponseSchema])
export const PersonalProfileResponseSchema = apiResponseSchema(PersonalProfileSchema)
export const PersonalProfileResultSchema = z.union([
  PersonalProfileResponseSchema,
  ErrorResponseSchema,
])

export type UserSummary = z.infer<typeof UserSummarySchema>
export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type PersonalProfile = z.infer<typeof PersonalProfileSchema>
export type PersonalProfileUpdate = z.infer<typeof PersonalProfileUpdateSchema>
export type PasswordUpdate = z.infer<typeof PasswordUpdateSchema>
export type UserPageResponse = z.infer<typeof UserPageResponseSchema>
export type UserPageResult = z.infer<typeof UserPageResultSchema>
export type PersonalProfileResponse = z.infer<typeof PersonalProfileResponseSchema>
export type PersonalProfileResult = z.infer<typeof PersonalProfileResultSchema>
