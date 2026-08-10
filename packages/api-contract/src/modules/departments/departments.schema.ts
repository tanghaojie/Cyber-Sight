import { z } from 'zod'
import {
  apiResponseSchema,
  AuditFieldsSchema,
  EntityIdSchema,
  ErrorResponseSchema,
} from '@/shared/http.js'

/** 部门契约以 parentId 表达树关系；null 是唯一的根节点标识。 */
export const DepartmentSummarySchema = AuditFieldsSchema.extend({
  id: EntityIdSchema,
  parentId: EntityIdSchema.nullable(),
  name: z.string(),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
})

export const DepartmentRequestSchema = z.strictObject({
  parentId: EntityIdSchema.nullable(),
  name: z.string().min(1).max(80),
  sortOrder: z.number().int().min(0),
  enabled: z.boolean(),
})

export const DepartmentOptionSchema = z.strictObject({
  id: EntityIdSchema,
  parentId: EntityIdSchema.nullable(),
  name: z.string(),
})

// 管理列表包含完整审计信息，下拉选项只暴露构建树选择器所需字段。
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
