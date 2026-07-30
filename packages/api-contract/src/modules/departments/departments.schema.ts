import { z } from 'zod'
import { apiResponseSchema, AuditFieldsSchema, ErrorResponseSchema } from '@/shared/http.js'

export const DepartmentSummarySchema = AuditFieldsSchema.extend({
  id: z.number().int(),
  parentId: z.number().int().min(0),
  code: z.string(),
  name: z.string(),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
})

export const DepartmentRequestSchema = z.strictObject({
  parentId: z.number().int().min(0),
  code: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[A-Z0-9_]+$/),
  name: z.string().min(1).max(80),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
})

export const DepartmentOptionSchema = z.strictObject({
  id: z.number().int(),
  parentId: z.number().int().min(0),
  code: z.string(),
  name: z.string(),
})

export const DepartmentListResponseSchema = apiResponseSchema(z.array(DepartmentSummarySchema))
export const DepartmentOptionListResponseSchema = apiResponseSchema(z.array(DepartmentOptionSchema))
export const DepartmentListResultSchema = z.union([
  DepartmentListResponseSchema,
  ErrorResponseSchema,
])
export const DepartmentOptionListResultSchema = z.union([
  DepartmentOptionListResponseSchema,
  ErrorResponseSchema,
])

export type DepartmentSummary = z.infer<typeof DepartmentSummarySchema>
export type DepartmentRequest = z.infer<typeof DepartmentRequestSchema>
export type DepartmentOption = z.infer<typeof DepartmentOptionSchema>
export type DepartmentListResponse = z.infer<typeof DepartmentListResponseSchema>
export type DepartmentOptionListResponse = z.infer<typeof DepartmentOptionListResponseSchema>
