import { z } from 'zod'
import {
  apiResponseSchema,
  AuditFieldsSchema,
  ErrorResponseSchema,
  paginatedResponseSchema,
} from '../../shared/http.js'

const menuCommonShape = {
  parentId: z.number().int().min(0),
  name: z.string().min(1).max(80),
  code: z.string().min(2).max(80).regex(/^[A-Z0-9_]+$/),
  icon: z.string().max(50),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
}

const directoryRequestSchema = z.strictObject({
  ...menuCommonShape,
  type: z.literal('directory'),
  path: z.literal(''),
  component: z.literal(''),
  externalUrl: z.literal(''),
})

const pageMenuRequestSchema = z.strictObject({
  ...menuCommonShape,
  type: z.literal('menu'),
  path: z.string().min(1).max(160).regex(/^\//),
  component: z.string().min(1).max(160),
  externalUrl: z.literal(''),
})

const externalButtonRequestSchema = z.strictObject({
  ...menuCommonShape,
  type: z.literal('button'),
  path: z.literal(''),
  component: z.literal(''),
  externalUrl: z.string().min(1).max(500).regex(/^https?:\/\//i),
})

export const MenuRequestSchema = z.discriminatedUnion('type', [
  directoryRequestSchema,
  pageMenuRequestSchema,
  externalButtonRequestSchema,
])

function withSummaryFields<T extends z.ZodRawShape>(shape: T) {
  return AuditFieldsSchema.extend({
    id: z.number().int(),
    ...shape,
  })
}

export const MenuSummarySchema = z.discriminatedUnion('type', [
  withSummaryFields(directoryRequestSchema.shape),
  withSummaryFields(pageMenuRequestSchema.shape),
  withSummaryFields(externalButtonRequestSchema.shape),
])

export const MenuPageResponseSchema = paginatedResponseSchema(MenuSummarySchema)
export const MenuPageResultSchema = z.union([
  MenuPageResponseSchema,
  ErrorResponseSchema,
])
export const MenuListResponseSchema = apiResponseSchema(z.array(MenuSummarySchema))

const NavigationMenuBaseSchema = z.strictObject({
  id: z.number().int(),
  parentId: z.number().int().min(0),
  name: z.string(),
  code: z.string(),
  icon: z.string(),
  sortOrder: z.number().int(),
  type: z.enum(['directory', 'menu', 'button']),
  path: z.string(),
  component: z.string(),
  externalUrl: z.string(),
})

type NavigationMenuBase = z.infer<typeof NavigationMenuBaseSchema>
export type NavigationMenu = NavigationMenuBase & {
  children: NavigationMenu[]
}

export const NavigationMenuSchema: z.ZodType<NavigationMenu> = z.lazy(() =>
  NavigationMenuBaseSchema.extend({
    children: z.array(NavigationMenuSchema),
  })
)

export const NavigationMenuResponseSchema = apiResponseSchema(
  z.array(NavigationMenuSchema)
)

export type MenuRequest = z.infer<typeof MenuRequestSchema>
export type MenuSummary = z.infer<typeof MenuSummarySchema>
export type MenuPageResponse = z.infer<typeof MenuPageResponseSchema>
export type MenuPageResult = z.infer<typeof MenuPageResultSchema>
export type MenuListResponse = z.infer<typeof MenuListResponseSchema>
export type NavigationMenuResponse = z.infer<
  typeof NavigationMenuResponseSchema
>
