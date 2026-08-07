import { z } from 'zod'
import {
  apiResponseSchema,
  AuditFieldsSchema,
  ErrorResponseSchema,
  PaginationRequestSchema,
  paginatedResponseSchema,
} from '@/shared/http.js'

export const PositionSummarySchema = AuditFieldsSchema.extend({
  id: z.number().int(),
  departmentId: z.number().int().min(1),
  name: z.string(),
  description: z.string(),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
})

export const PositionRequestSchema = z.strictObject({
  departmentId: z.number().int().min(1),
  name: z.string().min(1).max(80),
  description: z.string().max(200),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
})

export const PositionListQuerySchema = PaginationRequestSchema.extend({
  keyword: z.string().max(100).optional(),
  departmentId: z.coerce.number().int().min(1).optional(),
  enabled: z.enum(['true', 'false']).optional(),
})

export const PositionOptionSchema = z.strictObject({
  id: z.number().int(),
  departmentId: z.number().int().min(1),
  name: z.string(),
})

export const PositionPageResponseSchema = paginatedResponseSchema(PositionSummarySchema)
export const PositionPageResultSchema = z.union([PositionPageResponseSchema, ErrorResponseSchema])
export const PositionOptionListResponseSchema = apiResponseSchema(z.array(PositionOptionSchema))
export const PositionOptionListResultSchema = z.union([
  PositionOptionListResponseSchema,
  ErrorResponseSchema,
])

export type PositionSummary = z.infer<typeof PositionSummarySchema>
export type PositionRequest = z.infer<typeof PositionRequestSchema>
export type PositionListQuery = z.infer<typeof PositionListQuerySchema>
export type PositionOption = z.infer<typeof PositionOptionSchema>
export type PositionPageResponse = z.infer<typeof PositionPageResponseSchema>
export type PositionPageResult = z.infer<typeof PositionPageResultSchema>
export type PositionOptionListResponse = z.infer<typeof PositionOptionListResponseSchema>
export type PositionOptionListResult = z.infer<typeof PositionOptionListResultSchema>
