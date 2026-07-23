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

/**
 * Converts a transport-safe Zod schema to the JSON Schema dialect consumed by
 * Fastify 4, AJV and @fastify/swagger.
 */
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

export const HealthDataSchema = z.strictObject({
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
})

export const HealthResponseSchema = apiResponseSchema(HealthDataSchema)

export const LoginRequestSchema = z.strictObject({
  username: z.string().min(2).max(50),
  password: z.string().min(8).max(128),
})

export const CurrentUserSchema = z.strictObject({
  id: z.number().int(),
  username: z.string(),
  displayName: z.string(),
  roles: z.array(z.string()),
})

export const CurrentUserResponseSchema = apiResponseSchema(CurrentUserSchema)
export const LoginResultSchema = z.union([
  CurrentUserResponseSchema,
  ErrorResponseSchema,
])

export const AuditFieldsSchema = z.strictObject({
  isDeleted: z.boolean(),
  createdAt: z.iso.datetime(),
  createdBy: z.number().int(),
  updatedAt: z.iso.datetime(),
  updatedBy: z.number().int(),
})

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
  code: z.string().min(2).max(50).regex(/^[A-Z0-9_]+$/),
  description: z.string().max(200),
  enabled: z.boolean(),
  menuIds: integerArray,
})

export const RolePageResponseSchema = paginatedResponseSchema(RoleSummarySchema)
export const RolePageResultSchema = z.union([
  RolePageResponseSchema,
  ErrorResponseSchema,
])

const menuTypeSchema = z.enum(['directory', 'menu', 'button'])

export const MenuSummarySchema = AuditFieldsSchema.extend({
  id: z.number().int(),
  parentId: z.number().int(),
  name: z.string(),
  code: z.string(),
  path: z.string(),
  icon: z.string(),
  sortOrder: z.number().int(),
  type: menuTypeSchema,
  enabled: z.boolean(),
})

export const MenuRequestSchema = z.strictObject({
  parentId: z.number().int().min(0),
  name: z.string().min(1).max(80),
  code: z.string().min(2).max(80),
  path: z.string().max(160),
  icon: z.string().max(50),
  sortOrder: z.number().int().min(0),
  type: menuTypeSchema,
  enabled: z.boolean(),
})

export const MenuPageResponseSchema = paginatedResponseSchema(MenuSummarySchema)
export const MenuPageResultSchema = z.union([
  MenuPageResponseSchema,
  ErrorResponseSchema,
])

export const DictionarySummarySchema = AuditFieldsSchema.extend({
  id: z.number().int(),
  type: z.string(),
  label: z.string(),
  value: z.string(),
  sortOrder: z.number().int(),
  enabled: z.boolean(),
  remark: z.string(),
})

export const DictionaryRequestSchema = z.strictObject({
  type: z.string().min(1).max(80),
  label: z.string().min(1).max(80),
  value: z.string().min(1).max(120),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
  remark: z.string().max(200),
})

export const DictionaryPageResponseSchema = paginatedResponseSchema(
  DictionarySummarySchema
)
export const DictionaryPageResultSchema = z.union([
  DictionaryPageResponseSchema,
  ErrorResponseSchema,
])

export type PaginationRequest = z.infer<typeof PaginationRequestSchema>
export type ListQuery = z.infer<typeof ListQuerySchema>
export type IdParams = z.infer<typeof IdParamsSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type EmptySuccessResponse = z.infer<typeof EmptySuccessResponseSchema>
export type IdResponse = z.infer<typeof IdResponseSchema>
export type MutationResult = z.infer<typeof MutationResultSchema>
export type EmptyResult = z.infer<typeof EmptyResultSchema>
export type HealthData = z.infer<typeof HealthDataSchema>
export type HealthResponse = z.infer<typeof HealthResponseSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type CurrentUser = z.infer<typeof CurrentUserSchema>
export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>
export type LoginResult = z.infer<typeof LoginResultSchema>
export type UserSummary = z.infer<typeof UserSummarySchema>
export type UserCreate = z.infer<typeof UserCreateSchema>
export type UserUpdate = z.infer<typeof UserUpdateSchema>
export type UserPageResponse = z.infer<typeof UserPageResponseSchema>
export type UserPageResult = z.infer<typeof UserPageResultSchema>
export type RoleSummary = z.infer<typeof RoleSummarySchema>
export type RoleRequest = z.infer<typeof RoleRequestSchema>
export type RolePageResponse = z.infer<typeof RolePageResponseSchema>
export type RolePageResult = z.infer<typeof RolePageResultSchema>
export type MenuSummary = z.infer<typeof MenuSummarySchema>
export type MenuRequest = z.infer<typeof MenuRequestSchema>
export type MenuPageResponse = z.infer<typeof MenuPageResponseSchema>
export type MenuPageResult = z.infer<typeof MenuPageResultSchema>
export type DictionarySummary = z.infer<typeof DictionarySummarySchema>
export type DictionaryRequest = z.infer<typeof DictionaryRequestSchema>
export type DictionaryPageResponse = z.infer<
  typeof DictionaryPageResponseSchema
>
export type DictionaryPageResult = z.infer<
  typeof DictionaryPageResultSchema
>
