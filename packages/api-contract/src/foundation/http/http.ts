import { z } from 'zod'

/**
 * 汇总所有业务模块共用的 HTTP 包装结构和基础 Schema。
 * 业务模块只描述 data/list 中的领域数据，成功与失败外壳在这里保持一致。
 */
export type HttpJsonSchema = Record<string, unknown>

export interface ApiResponse<T = unknown> {
  status: number
  data?: T
  err?: string
}

export interface PaginatedResponse<T = unknown> {
  status: number
  list: T[]
  total: number
  err?: string
}

export function toJsonSchema(
  schema: z.ZodType,
  target: 'draft-7' | 'openapi-3.0' = 'draft-7',
): HttpJsonSchema {
  const jsonSchema = z.toJSONSchema(schema, {
    target,
  }) as HttpJsonSchema
  // 返回可嵌入 HTTP 适配层的 Schema；顶层方言声明交给文档容器统一管理。
  const { $schema: _dialect, ...httpSchema } = jsonSchema
  return httpSchema
}

export function toOpenApiSchema(schema: z.ZodType): HttpJsonSchema {
  return toJsonSchema(schema, 'openapi-3.0')
}

// 分页默认值记录在 Schema 元数据中，实际补默认值由后端分页辅助函数完成。
export const PaginationRequestSchema = z.strictObject({
  pageNum: z.coerce.number().int().min(1).optional().meta({ default: 1 }),
  pageSize: z.coerce.number().int().min(1).max(100).optional().meta({ default: 10 }),
})

export const ListQuerySchema = PaginationRequestSchema.extend({
  keyword: z.string().max(100).optional(),
})

export const NilEntityId = '00000000-0000-0000-0000-000000000000'
export const EntityIdSchema = z.uuid().refine((value) => value !== NilEntityId, {
  message: 'Nil UUID is not a valid entity ID',
})

export const IdParamsSchema = z.strictObject({
  id: EntityIdSchema,
})

export const ErrorResponseSchema = z.strictObject({
  status: z.number().int().min(1),
  err: z.string(),
})

export const EmptySuccessResponseSchema = z.strictObject({
  status: z.literal(0),
})

export const IdDataSchema = z.strictObject({
  id: EntityIdSchema,
})

export function apiResponseSchema<T extends z.ZodType>(data: T) {
  return z.strictObject({
    status: z.literal(0),
    data,
  })
}

export function paginatedResponseSchema<T extends z.ZodType>(item: T) {
  return z.strictObject({
    status: z.literal(0),
    list: z.array(item),
    total: z.number().int().min(0),
  })
}

// 写操作既可能返回成功数据，也可能以 HTTP 200 返回非零业务错误。
export const IdResponseSchema = apiResponseSchema(IdDataSchema)
export const MutationResultSchema = z.union([IdResponseSchema, ErrorResponseSchema])
export const EmptyResultSchema = z.union([EmptySuccessResponseSchema, ErrorResponseSchema])

export const AuditFieldsSchema = z.strictObject({
  isDeleted: z.boolean(),
  createdAt: z.iso.datetime(),
  createdBy: EntityIdSchema.nullable(),
  updatedAt: z.iso.datetime(),
  updatedBy: EntityIdSchema.nullable(),
})

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>
export type ListQuery = z.infer<typeof ListQuerySchema>
export type EntityId = z.infer<typeof EntityIdSchema>
export type IdParams = z.infer<typeof IdParamsSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type EmptySuccessResponse = z.infer<typeof EmptySuccessResponseSchema>
export type IdResponse = z.infer<typeof IdResponseSchema>
export type MutationResult = z.infer<typeof MutationResultSchema>
export type EmptyResult = z.infer<typeof EmptyResultSchema>
