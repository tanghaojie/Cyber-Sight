import { z } from 'zod'
import {
  apiResponseSchema,
  AuditFieldsSchema,
  EntityIdSchema,
  ErrorResponseSchema,
  paginatedResponseSchema,
} from '@/foundation/http/http.js'

/** 角色契约：角色 ID 用于内部关联，名称和描述用于管理界面展示。 */
export const RoleSummarySchema = AuditFieldsSchema.extend({
  id: EntityIdSchema,
  name: z.string(),
  description: z.string(),
  enabled: z.boolean(),
})

export const RoleRequestSchema = z.strictObject({
  name: z.string().min(1).max(80),
  description: z.string().max(200),
  enabled: z.boolean(),
})

export const RolePageResponseSchema = paginatedResponseSchema(RoleSummarySchema)
export const RolePageResultSchema = z.union([RolePageResponseSchema, ErrorResponseSchema])
export const RoleListResponseSchema = apiResponseSchema(z.array(RoleSummarySchema))

export type RoleSummary = z.infer<typeof RoleSummarySchema>
export type RoleRequest = z.infer<typeof RoleRequestSchema>
export type RolePageResponse = z.infer<typeof RolePageResponseSchema>
export type RolePageResult = z.infer<typeof RolePageResultSchema>
export type RoleListResponse = z.infer<typeof RoleListResponseSchema>
