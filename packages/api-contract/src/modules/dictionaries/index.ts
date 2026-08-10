import { z } from 'zod'
import {
  AuditFieldsSchema,
  EntityIdSchema,
  ErrorResponseSchema,
  paginatedResponseSchema,
} from '@/shared/http.js'

/** 字典项由 type 分组，value 供业务保存，label 供界面展示。 */
export const DictionarySummarySchema = AuditFieldsSchema.extend({
  id: EntityIdSchema,
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

export const DictionaryPageResponseSchema = paginatedResponseSchema(DictionarySummarySchema)
export const DictionaryPageResultSchema = z.union([
  DictionaryPageResponseSchema,
  ErrorResponseSchema,
])

export type DictionarySummary = z.infer<typeof DictionarySummarySchema>
export type DictionaryRequest = z.infer<typeof DictionaryRequestSchema>
export type DictionaryPageResponse = z.infer<typeof DictionaryPageResponseSchema>
export type DictionaryPageResult = z.infer<typeof DictionaryPageResultSchema>
