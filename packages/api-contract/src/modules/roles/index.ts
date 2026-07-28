import { z } from 'zod'
import {
  apiResponseSchema,
  AuditFieldsSchema,
  ErrorResponseSchema,
  paginatedResponseSchema,
} from '@/shared/http.js'

const integerArray = z.array(z.number().int())

export const RoleSummarySchema = AuditFieldsSchema.extend({
  id: z.number().int(),
  name: z.string(),
  code: z.string(),
  description: z.string(),
  enabled: z.boolean(),
  menuIds: integerArray,
})

export const RoleRequestSchema = z.strictObject({
  name: z.string().min(1).max(80),
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Z0-9_]+$/),
  description: z.string().max(200),
  enabled: z.boolean(),
  menuIds: integerArray,
})

export const RolePageResponseSchema = paginatedResponseSchema(RoleSummarySchema)
export const RolePageResultSchema = z.union([RolePageResponseSchema, ErrorResponseSchema])
export const RoleListResponseSchema = apiResponseSchema(z.array(RoleSummarySchema))

export type RoleSummary = z.infer<typeof RoleSummarySchema>
export type RoleRequest = z.infer<typeof RoleRequestSchema>
export type RolePageResponse = z.infer<typeof RolePageResponseSchema>
export type RolePageResult = z.infer<typeof RolePageResultSchema>
export type RoleListResponse = z.infer<typeof RoleListResponseSchema>
