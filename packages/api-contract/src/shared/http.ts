import { z } from 'zod'

export type FastifyJsonSchema = Record<string, unknown>

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

export function toFastifySchema(schema: z.ZodType): FastifyJsonSchema {
  const jsonSchema = z.toJSONSchema(schema, {
    target: 'draft-7',
  }) as FastifyJsonSchema
  const { $schema: _dialect, ...fastifySchema } = jsonSchema
  return fastifySchema
}

export const PaginationRequestSchema = z.strictObject({
  pageNum: z.number().int().min(1).optional().meta({ default: 1 }),
  pageSize: z
    .number()
    .int()
    .min(1)
    .max(100)
    .optional()
    .meta({ default: 10 }),
})

export const ListQuerySchema = PaginationRequestSchema.extend({
  keyword: z.string().max(100).optional(),
})

export const IdParamsSchema = z.strictObject({
  id: z.number().int().min(1),
})

export const ErrorResponseSchema = z.strictObject({
  status: z.number().int().min(1),
  err: z.string(),
})

export const EmptySuccessResponseSchema = z.strictObject({
  status: z.literal(0),
})

export const IdDataSchema = z.strictObject({
  id: z.number().int(),
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

export const IdResponseSchema = apiResponseSchema(IdDataSchema)
export const MutationResultSchema = z.union([
  IdResponseSchema,
  ErrorResponseSchema,
])
export const EmptyResultSchema = z.union([
  EmptySuccessResponseSchema,
  ErrorResponseSchema,
])

export const AuditFieldsSchema = z.strictObject({
  isDeleted: z.boolean(),
  createdAt: z.iso.datetime(),
  createdBy: z.number().int(),
  updatedAt: z.iso.datetime(),
  updatedBy: z.number().int(),
})

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>
export type ListQuery = z.infer<typeof ListQuerySchema>
export type IdParams = z.infer<typeof IdParamsSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type EmptySuccessResponse = z.infer<typeof EmptySuccessResponseSchema>
export type IdResponse = z.infer<typeof IdResponseSchema>
export type MutationResult = z.infer<typeof MutationResultSchema>
export type EmptyResult = z.infer<typeof EmptyResultSchema>
