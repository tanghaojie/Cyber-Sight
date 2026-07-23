import { Type, type Static, type TSchema } from '@sinclair/typebox'

const strictObject = { additionalProperties: false } as const

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

export const PaginationRequestSchema = Type.Object(
  {
    pageNum: Type.Optional(Type.Integer({ minimum: 1, default: 1 })),
    pageSize: Type.Optional(
      Type.Integer({ minimum: 1, maximum: 100, default: 10 })
    ),
  },
  strictObject
)

export const ListQuerySchema = Type.Object(
  {
    ...PaginationRequestSchema.properties,
    keyword: Type.Optional(Type.String({ maxLength: 100 })),
  },
  strictObject
)

export const IdParamsSchema = Type.Object(
  {
    id: Type.Integer({ minimum: 1 }),
  },
  strictObject
)

export const ErrorResponseSchema = Type.Object(
  {
    status: Type.Integer({ minimum: 1 }),
    err: Type.String(),
  },
  strictObject
)

export const EmptySuccessResponseSchema = Type.Object(
  {
    status: Type.Literal(0),
  },
  strictObject
)

export const IdDataSchema = Type.Object(
  {
    id: Type.Integer(),
  },
  strictObject
)

export function apiResponseSchema<T extends TSchema>(data: T) {
  return Type.Object(
    {
      status: Type.Literal(0),
      data,
    },
    strictObject
  )
}

export function paginatedResponseSchema<T extends TSchema>(item: T) {
  return Type.Object(
    {
      status: Type.Literal(0),
      list: Type.Array(item),
      total: Type.Integer({ minimum: 0 }),
    },
    strictObject
  )
}

export const IdResponseSchema = apiResponseSchema(IdDataSchema)
export const MutationResultSchema = Type.Union([
  IdResponseSchema,
  ErrorResponseSchema,
])
export const EmptyResultSchema = Type.Union([
  EmptySuccessResponseSchema,
  ErrorResponseSchema,
])

export const HealthDataSchema = Type.Object(
  {
    status: Type.Literal('ok'),
    timestamp: Type.String({ format: 'date-time' }),
  },
  strictObject
)

export const HealthResponseSchema = apiResponseSchema(HealthDataSchema)

export const LoginRequestSchema = Type.Object(
  {
    username: Type.String({ minLength: 2, maxLength: 50 }),
    password: Type.String({ minLength: 8, maxLength: 128 }),
  },
  strictObject
)

export const CurrentUserSchema = Type.Object(
  {
    id: Type.Integer(),
    username: Type.String(),
    displayName: Type.String(),
    roles: Type.Array(Type.String()),
  },
  strictObject
)

export const CurrentUserResponseSchema = apiResponseSchema(CurrentUserSchema)
export const LoginResultSchema = Type.Union([
  CurrentUserResponseSchema,
  ErrorResponseSchema,
])

export const AuditFieldsSchema = Type.Object(
  {
    isDeleted: Type.Boolean(),
    createdAt: Type.String({ format: 'date-time' }),
    createdBy: Type.Integer(),
    updatedAt: Type.String({ format: 'date-time' }),
    updatedBy: Type.Integer(),
  },
  strictObject
)

const integerArray = Type.Array(Type.Integer())

export const UserSummarySchema = Type.Object(
  {
    ...AuditFieldsSchema.properties,
    id: Type.Integer(),
    username: Type.String(),
    displayName: Type.String(),
    email: Type.String({ format: 'email' }),
    enabled: Type.Boolean(),
    roleIds: integerArray,
    lastLoginAt: Type.Optional(
      Type.Union([Type.String({ format: 'date-time' }), Type.Null()])
    ),
  },
  strictObject
)

export const UserCreateSchema = Type.Object(
  {
    username: Type.String({ minLength: 2, maxLength: 50 }),
    displayName: Type.String({ minLength: 1, maxLength: 80 }),
    email: Type.String({ format: 'email' }),
    password: Type.String({ minLength: 8, maxLength: 128 }),
    enabled: Type.Boolean(),
    roleIds: integerArray,
  },
  strictObject
)

export const UserUpdateSchema = Type.Object(
  {
    displayName: Type.String({ minLength: 1, maxLength: 80 }),
    email: Type.String({ format: 'email' }),
    password: Type.Optional(Type.String({ minLength: 8, maxLength: 128 })),
    enabled: Type.Boolean(),
    roleIds: integerArray,
  },
  strictObject
)

export const UserPageResponseSchema = paginatedResponseSchema(UserSummarySchema)
export const UserPageResultSchema = Type.Union([
  UserPageResponseSchema,
  ErrorResponseSchema,
])

export const RoleSummarySchema = Type.Object(
  {
    ...AuditFieldsSchema.properties,
    id: Type.Integer(),
    name: Type.String(),
    code: Type.String(),
    description: Type.String(),
    enabled: Type.Boolean(),
    menuIds: integerArray,
  },
  strictObject
)

export const RoleRequestSchema = Type.Object(
  {
    name: Type.String({ minLength: 1, maxLength: 80 }),
    code: Type.String({
      minLength: 2,
      maxLength: 50,
      pattern: '^[A-Z0-9_]+$',
    }),
    description: Type.String({ maxLength: 200 }),
    enabled: Type.Boolean(),
    menuIds: integerArray,
  },
  strictObject
)

export const RolePageResponseSchema = paginatedResponseSchema(RoleSummarySchema)
export const RolePageResultSchema = Type.Union([
  RolePageResponseSchema,
  ErrorResponseSchema,
])

export const MenuSummarySchema = Type.Object(
  {
    ...AuditFieldsSchema.properties,
    id: Type.Integer(),
    parentId: Type.Integer(),
    name: Type.String(),
    code: Type.String(),
    path: Type.String(),
    icon: Type.String(),
    sortOrder: Type.Integer(),
    type: Type.Union([
      Type.Literal('directory'),
      Type.Literal('menu'),
      Type.Literal('button'),
    ]),
    enabled: Type.Boolean(),
  },
  strictObject
)

export const MenuRequestSchema = Type.Object(
  {
    parentId: Type.Integer({ minimum: 0 }),
    name: Type.String({ minLength: 1, maxLength: 80 }),
    code: Type.String({ minLength: 2, maxLength: 80 }),
    path: Type.String({ maxLength: 160 }),
    icon: Type.String({ maxLength: 50 }),
    sortOrder: Type.Integer({ minimum: 0 }),
    type: Type.Union([
      Type.Literal('directory'),
      Type.Literal('menu'),
      Type.Literal('button'),
    ]),
    enabled: Type.Boolean(),
  },
  strictObject
)

export const MenuPageResponseSchema = paginatedResponseSchema(MenuSummarySchema)
export const MenuPageResultSchema = Type.Union([
  MenuPageResponseSchema,
  ErrorResponseSchema,
])

export const DictionarySummarySchema = Type.Object(
  {
    ...AuditFieldsSchema.properties,
    id: Type.Integer(),
    type: Type.String(),
    label: Type.String(),
    value: Type.String(),
    sortOrder: Type.Integer(),
    enabled: Type.Boolean(),
    remark: Type.String(),
  },
  strictObject
)

export const DictionaryRequestSchema = Type.Object(
  {
    type: Type.String({ minLength: 1, maxLength: 80 }),
    label: Type.String({ minLength: 1, maxLength: 80 }),
    value: Type.String({ minLength: 1, maxLength: 120 }),
    sortOrder: Type.Integer({ minimum: 0 }),
    enabled: Type.Boolean(),
    remark: Type.String({ maxLength: 200 }),
  },
  strictObject
)

export const DictionaryPageResponseSchema = paginatedResponseSchema(
  DictionarySummarySchema
)
export const DictionaryPageResultSchema = Type.Union([
  DictionaryPageResponseSchema,
  ErrorResponseSchema,
])

export type PaginationRequest = Static<typeof PaginationRequestSchema>
export type ListQuery = Static<typeof ListQuerySchema>
export type IdParams = Static<typeof IdParamsSchema>
export type ErrorResponse = Static<typeof ErrorResponseSchema>
export type EmptySuccessResponse = Static<typeof EmptySuccessResponseSchema>
export type IdResponse = Static<typeof IdResponseSchema>
export type MutationResult = Static<typeof MutationResultSchema>
export type EmptyResult = Static<typeof EmptyResultSchema>
export type HealthData = Static<typeof HealthDataSchema>
export type HealthResponse = Static<typeof HealthResponseSchema>
export type LoginRequest = Static<typeof LoginRequestSchema>
export type CurrentUser = Static<typeof CurrentUserSchema>
export type CurrentUserResponse = Static<typeof CurrentUserResponseSchema>
export type LoginResult = Static<typeof LoginResultSchema>
export type UserSummary = Static<typeof UserSummarySchema>
export type UserCreate = Static<typeof UserCreateSchema>
export type UserUpdate = Static<typeof UserUpdateSchema>
export type UserPageResponse = Static<typeof UserPageResponseSchema>
export type UserPageResult = Static<typeof UserPageResultSchema>
export type RoleSummary = Static<typeof RoleSummarySchema>
export type RoleRequest = Static<typeof RoleRequestSchema>
export type RolePageResponse = Static<typeof RolePageResponseSchema>
export type RolePageResult = Static<typeof RolePageResultSchema>
export type MenuSummary = Static<typeof MenuSummarySchema>
export type MenuRequest = Static<typeof MenuRequestSchema>
export type MenuPageResponse = Static<typeof MenuPageResponseSchema>
export type MenuPageResult = Static<typeof MenuPageResultSchema>
export type DictionarySummary = Static<typeof DictionarySummarySchema>
export type DictionaryRequest = Static<typeof DictionaryRequestSchema>
export type DictionaryPageResponse = Static<
  typeof DictionaryPageResponseSchema
>
export type DictionaryPageResult = Static<typeof DictionaryPageResultSchema>
