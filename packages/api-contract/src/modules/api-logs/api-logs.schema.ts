import { z } from 'zod'
import {
  ErrorResponseSchema,
  PaginationRequestSchema,
  paginatedResponseSchema,
} from '@/shared/http.js'

/** 接口日志查询只接受可索引的最小筛选条件，不暴露请求内容或敏感 HTTP 元数据。 */
export const ApiLogQuerySchema = PaginationRequestSchema.extend({
  actorUserId: z.coerce.number().int().min(1).optional(),
  actorUsername: z.string().min(1).max(50).optional(),
  method: z.string().min(1).max(10).optional(),
  routePattern: z.string().min(1).max(160).optional(),
  httpStatus: z.coerce.number().int().min(100).max(599).optional(),
  retention: z.enum(['permanent', 'temporary']).optional(),
  occurredFrom: z.iso.datetime().optional(),
  occurredTo: z.iso.datetime().optional(),
})

export const ApiLogItemSchema = z.strictObject({
  id: z.number().int(),
  occurredAt: z.iso.datetime(),
  expiresAt: z.iso.datetime().nullable(),
  requestId: z.string(),
  actorUserId: z.number().int().nullable(),
  actorUsername: z.string().nullable(),
  method: z.string(),
  routePattern: z.string(),
  httpStatus: z.number().int(),
  businessStatus: z.number().int().nullable(),
  durationMs: z.number().int().min(0),
})

export const ApiLogPageResponseSchema = paginatedResponseSchema(ApiLogItemSchema)
export const ApiLogPageResultSchema = z.union([ApiLogPageResponseSchema, ErrorResponseSchema])

export type ApiLogQuery = z.infer<typeof ApiLogQuerySchema>
export type ApiLogItem = z.infer<typeof ApiLogItemSchema>
export type ApiLogPageResponse = z.infer<typeof ApiLogPageResponseSchema>
export type ApiLogPageResult = z.infer<typeof ApiLogPageResultSchema>
