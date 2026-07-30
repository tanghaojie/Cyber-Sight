import { z } from 'zod'
import { apiResponseSchema, ErrorResponseSchema } from '@/shared/http.js'

export const PermissionKeySchema = z
  .string()
  .min(3)
  .max(100)
  .regex(/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/)

export const AuthorizationSubjectTypeSchema = z.enum(['user', 'role', 'department'])
export const DataScopeTypeSchema = z.enum([
  'self',
  'own_department',
  'own_department_tree',
  'custom_departments',
  'all',
])
export const DataActionSchema = z
  .string()
  .min(1)
  .max(50)
  .regex(/^[a-z][a-z0-9_-]*$/)

export const PermissionSummarySchema = z.strictObject({
  key: PermissionKeySchema,
  module: z.string(),
  name: z.string(),
  description: z.string(),
})

export const DataResourceDefinitionSchema = z.strictObject({
  key: z.string().min(1).max(100),
  name: z.string().min(1).max(100),
  actions: z.array(DataActionSchema),
  scopeTypes: z.array(DataScopeTypeSchema),
})

export const DataPolicyInputSchema = z
  .strictObject({
    resourceKey: z.string().min(1).max(100),
    action: DataActionSchema,
    scopeType: DataScopeTypeSchema,
    inheritToChildren: z.boolean(),
    departmentIds: z.array(z.number().int().min(1)),
    includeDescendants: z.boolean(),
  })
  .superRefine(function validateCustomDepartments(policy, context) {
    if (policy.scopeType === 'custom_departments' && policy.departmentIds.length === 0) {
      context.addIssue({
        code: 'custom',
        path: ['departmentIds'],
        message: 'Custom department scope requires at least one department',
      })
    }
    if (new Set(policy.departmentIds).size !== policy.departmentIds.length) {
      context.addIssue({
        code: 'custom',
        path: ['departmentIds'],
        message: 'Department IDs must be unique',
      })
    }
    if (policy.scopeType !== 'custom_departments' && policy.departmentIds.length > 0) {
      context.addIssue({
        code: 'custom',
        path: ['departmentIds'],
        message: 'Only custom department scope accepts department IDs',
      })
    }
  })

export const SubjectAccessRequestSchema = z.strictObject({
  permissionKeys: z.array(PermissionKeySchema),
  dataPolicies: z.array(DataPolicyInputSchema),
})

export const PermissionListResponseSchema = apiResponseSchema(z.array(PermissionSummarySchema))
export const DataResourceListResponseSchema = apiResponseSchema(
  z.array(DataResourceDefinitionSchema),
)
export const SubjectAccessResponseSchema = apiResponseSchema(SubjectAccessRequestSchema)
export const PermissionListResultSchema = z.union([
  PermissionListResponseSchema,
  ErrorResponseSchema,
])
export const DataResourceListResultSchema = z.union([
  DataResourceListResponseSchema,
  ErrorResponseSchema,
])
export const SubjectAccessResultSchema = z.union([SubjectAccessResponseSchema, ErrorResponseSchema])

export type PermissionKey = z.infer<typeof PermissionKeySchema>
export type AuthorizationSubjectType = z.infer<typeof AuthorizationSubjectTypeSchema>
export type DataScopeType = z.infer<typeof DataScopeTypeSchema>
export type DataAction = z.infer<typeof DataActionSchema>
export type PermissionSummary = z.infer<typeof PermissionSummarySchema>
export type DataResourceDefinition = z.infer<typeof DataResourceDefinitionSchema>
export type DataPolicyInput = z.infer<typeof DataPolicyInputSchema>
export type SubjectAccessRequest = z.infer<typeof SubjectAccessRequestSchema>
export type PermissionListResponse = z.infer<typeof PermissionListResponseSchema>
export type DataResourceListResponse = z.infer<typeof DataResourceListResponseSchema>
export type SubjectAccessResponse = z.infer<typeof SubjectAccessResponseSchema>
