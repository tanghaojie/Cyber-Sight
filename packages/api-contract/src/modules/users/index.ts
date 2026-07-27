import { z } from 'zod'
import {
  AuditFieldsSchema,
  ErrorResponseSchema,
  paginatedResponseSchema,
} from '../../shared/http.js'

const integerArray = z.array(z.number().int())

export const UserSummarySchema = AuditFieldsSchema.extend({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string(),
  email: z.email(),
  enabled: z.boolean(),
  roleIds: integerArray,
  lastLoginAt: z.iso.datetime().nullable().optional(),
})

export const UserCreateSchema = z.strictObject({
  username: z.string().min(2).max(50),
  displayName: z.string().min(1).max(80),
  email: z.email(),
  password: z.string().min(8).max(128),
  enabled: z.boolean(),
  roleIds: integerArray,
})

export const UserUpdateSchema = z.strictObject({
  displayName: z.string().min(1).max(80),
  email: z.email(),
  password: z.string().min(8).max(128).optional(),
  enabled: z.boolean(),
  roleIds: integerArray,
})

export const UserPageResponseSchema = paginatedResponseSchema(UserSummarySchema)
export const UserPageResultSchema = z.union([
  UserPageResponseSchema,
  ErrorResponseSchema,
])

export type UserSummary = z.infer<typeof UserSummarySchema>
export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type UserPageResponse = z.infer<typeof UserPageResponseSchema>
export type UserPageResult = z.infer<typeof UserPageResultSchema>
