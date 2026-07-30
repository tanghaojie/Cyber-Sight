import { and, eq, inArray, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type {
  AuthorizationSubjectType,
  DataAction,
  DataPolicyInput,
  PermissionSummary,
  SubjectAccessRequest,
} from '@scaffold/api-contract'
import {
  dataPolicyDepartments,
  dataPolicyRules,
  permissions,
  rolePermissions,
} from '@/db/schema.js'
import {
  ancestorDepartmentIds,
  departmentExists,
  descendantDepartmentIds,
  enabledDepartmentIds,
} from '@/modules/departments/departments.access.js'
import { enabledRoleIds, roleExists } from '@/modules/roles/roles.access.js'
import { assignedDepartmentIds, assignedRoleIds, userExists } from '@/modules/users/users.access.js'
import { isRegisteredDataPolicy } from './authorization.resources.js'

export interface DataAccessPlan {
  unrestricted: boolean
  ownerUserIds: number[]
  departmentIds: number[]
}

interface PolicyRow {
  id: number
  resourceKey: string
  action: string
  scopeType: DataPolicyInput['scopeType']
}

function unique(values: number[]): number[] {
  return [...new Set(values)]
}

export function mergeDataAccessPlans(plans: DataAccessPlan[]): DataAccessPlan {
  if (plans.some((plan) => plan.unrestricted)) {
    return { unrestricted: true, ownerUserIds: [], departmentIds: [] }
  }
  return {
    unrestricted: false,
    ownerUserIds: unique(plans.flatMap((plan) => plan.ownerUserIds)),
    departmentIds: unique(plans.flatMap((plan) => plan.departmentIds)),
  }
}

export async function listPermissions(app: FastifyInstance): Promise<PermissionSummary[]> {
  return app.db
    .select({
      key: permissions.key,
      module: permissions.module,
      name: permissions.name,
      description: permissions.description,
    })
    .from(permissions)
    .where(and(eq(permissions.enabled, true), eq(permissions.isDeleted, false)))
    .orderBy(permissions.module, permissions.key)
}

export async function effectivePermissionKeys(
  app: FastifyInstance,
  userId: number,
): Promise<string[]> {
  const roleIds = await enabledRoleIds(app, await assignedRoleIds(app, userId))
  if (roleIds.length === 0) {
    return []
  }
  const rows = await app.db
    .select({ key: rolePermissions.permissionKey })
    .from(rolePermissions)
    .innerJoin(
      permissions,
      and(
        eq(rolePermissions.permissionKey, permissions.key),
        eq(permissions.enabled, true),
        eq(permissions.isDeleted, false),
      ),
    )
    .where(and(inArray(rolePermissions.roleId, roleIds), eq(rolePermissions.isDeleted, false)))

  return [...new Set(rows.map((row) => row.key))]
}

export async function hasAnyPermission(
  app: FastifyInstance,
  userId: number,
  requiredKeys: readonly string[],
): Promise<boolean> {
  if (requiredKeys.length === 0) {
    return false
  }
  const actual = new Set(await effectivePermissionKeys(app, userId))
  return requiredKeys.some((key) => actual.has(key))
}

export async function getSubjectAccess(
  app: FastifyInstance,
  subjectType: AuthorizationSubjectType,
  subjectId: number,
): Promise<SubjectAccessRequest> {
  const permissionRows =
    subjectType === 'role'
      ? await app.db
          .select({ key: rolePermissions.permissionKey })
          .from(rolePermissions)
          .innerJoin(
            permissions,
            and(
              eq(rolePermissions.permissionKey, permissions.key),
              eq(permissions.enabled, true),
              eq(permissions.isDeleted, false),
            ),
          )
          .where(and(eq(rolePermissions.roleId, subjectId), eq(rolePermissions.isDeleted, false)))
      : []
  const policyRows = await app.db
    .select({
      id: dataPolicyRules.id,
      resourceKey: dataPolicyRules.resourceKey,
      action: dataPolicyRules.action,
      scopeType: dataPolicyRules.scopeType,
      inheritToChildren: dataPolicyRules.inheritToChildren,
    })
    .from(dataPolicyRules)
    .where(
      and(
        eq(dataPolicyRules.subjectType, subjectType),
        eq(dataPolicyRules.subjectId, subjectId),
        eq(dataPolicyRules.enabled, true),
        eq(dataPolicyRules.isDeleted, false),
      ),
    )
    .orderBy(dataPolicyRules.resourceKey, dataPolicyRules.action, dataPolicyRules.id)
  const ruleIds = policyRows.map((row) => row.id)
  const departmentRows = ruleIds.length
    ? await app.db
        .select({
          ruleId: dataPolicyDepartments.ruleId,
          departmentId: dataPolicyDepartments.departmentId,
          includeDescendants: dataPolicyDepartments.includeDescendants,
        })
        .from(dataPolicyDepartments)
        .where(
          and(
            inArray(dataPolicyDepartments.ruleId, ruleIds),
            eq(dataPolicyDepartments.isDeleted, false),
          ),
        )
    : []

  return {
    permissionKeys: permissionRows.map((row) => row.key),
    dataPolicies: policyRows.map((row) => {
      const assignments = departmentRows.filter((item) => item.ruleId === row.id)
      return {
        resourceKey: row.resourceKey,
        action: row.action,
        scopeType: row.scopeType,
        inheritToChildren: row.inheritToChildren,
        departmentIds: assignments.map((item) => item.departmentId),
        includeDescendants: assignments.some((item) => item.includeDescendants),
      }
    }),
  }
}

export async function authorizationSubjectExists(
  app: FastifyInstance,
  subjectType: AuthorizationSubjectType,
  subjectId: number,
): Promise<boolean> {
  switch (subjectType) {
    case 'user':
      return userExists(app, subjectId)
    case 'role':
      return roleExists(app, subjectId)
    case 'department':
      return departmentExists(app, subjectId)
  }
}

async function validateSubjectAccess(
  app: FastifyInstance,
  subjectType: AuthorizationSubjectType,
  input: SubjectAccessRequest,
): Promise<boolean> {
  if (subjectType !== 'role' && input.permissionKeys.length > 0) {
    return false
  }
  const uniquePermissionKeys = new Set(input.permissionKeys)
  if (uniquePermissionKeys.size !== input.permissionKeys.length) {
    return false
  }
  if (uniquePermissionKeys.size > 0) {
    const rows = await app.db
      .select({ key: permissions.key })
      .from(permissions)
      .where(
        and(
          inArray(permissions.key, [...uniquePermissionKeys]),
          eq(permissions.enabled, true),
          eq(permissions.isDeleted, false),
        ),
      )
    if (rows.length !== uniquePermissionKeys.size) {
      return false
    }
  }

  const policyIdentities = new Set<string>()
  const departmentIds: number[] = []
  for (const policy of input.dataPolicies) {
    if (
      !isRegisteredDataPolicy(policy.resourceKey, policy.action, policy.scopeType) ||
      (subjectType !== 'department' && policy.inheritToChildren) ||
      (policy.scopeType !== 'custom_departments' && policy.includeDescendants)
    ) {
      return false
    }
    const identity = `${policy.resourceKey}:${policy.action}:${policy.scopeType}`
    if (policyIdentities.has(identity)) {
      return false
    }
    policyIdentities.add(identity)
    departmentIds.push(...policy.departmentIds)
  }
  const uniqueDepartmentIds = unique(departmentIds)
  if (uniqueDepartmentIds.length > 0) {
    const validIds = await enabledDepartmentIds(app, uniqueDepartmentIds)
    if (validIds.length !== uniqueDepartmentIds.length) {
      return false
    }
  }
  return true
}

export async function replaceSubjectAccess(
  app: FastifyInstance,
  subjectType: AuthorizationSubjectType,
  subjectId: number,
  input: SubjectAccessRequest,
  actorId: number,
): Promise<boolean> {
  if (!(await validateSubjectAccess(app, subjectType, input))) {
    return false
  }

  await app.db.transaction(async function replaceAccess(tx) {
    const now = new Date()
    if (subjectType === 'role') {
      await tx
        .update(rolePermissions)
        .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
        .where(and(eq(rolePermissions.roleId, subjectId), eq(rolePermissions.isDeleted, false)))
      for (const permissionKey of input.permissionKeys) {
        const [existing] = await tx
          .select({ id: rolePermissions.id })
          .from(rolePermissions)
          .where(
            and(
              eq(rolePermissions.roleId, subjectId),
              eq(rolePermissions.permissionKey, permissionKey),
            ),
          )
          .limit(1)
        if (existing) {
          await tx
            .update(rolePermissions)
            .set({ isDeleted: false, updatedAt: now, updatedBy: actorId })
            .where(eq(rolePermissions.id, existing.id))
        } else {
          await tx.insert(rolePermissions).values({
            roleId: subjectId,
            permissionKey,
            createdBy: actorId,
            updatedBy: actorId,
          })
        }
      }
    }

    const oldRules = await tx
      .select({ id: dataPolicyRules.id })
      .from(dataPolicyRules)
      .where(
        and(
          eq(dataPolicyRules.subjectType, subjectType),
          eq(dataPolicyRules.subjectId, subjectId),
          eq(dataPolicyRules.isDeleted, false),
        ),
      )
    const oldRuleIds = oldRules.map((row) => row.id)
    if (oldRuleIds.length > 0) {
      await tx
        .update(dataPolicyDepartments)
        .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
        .where(
          and(
            inArray(dataPolicyDepartments.ruleId, oldRuleIds),
            eq(dataPolicyDepartments.isDeleted, false),
          ),
        )
      await tx
        .update(dataPolicyRules)
        .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
        .where(inArray(dataPolicyRules.id, oldRuleIds))
    }

    for (const policy of input.dataPolicies) {
      const [existing] = await tx
        .select({ id: dataPolicyRules.id })
        .from(dataPolicyRules)
        .where(
          and(
            eq(dataPolicyRules.subjectType, subjectType),
            eq(dataPolicyRules.subjectId, subjectId),
            eq(dataPolicyRules.resourceKey, policy.resourceKey),
            eq(dataPolicyRules.action, policy.action),
            eq(dataPolicyRules.scopeType, policy.scopeType),
          ),
        )
        .limit(1)
      let ruleId: number
      if (existing) {
        ruleId = existing.id
        await tx
          .update(dataPolicyRules)
          .set({
            enabled: true,
            inheritToChildren: policy.inheritToChildren,
            isDeleted: false,
            updatedAt: now,
            updatedBy: actorId,
          })
          .where(eq(dataPolicyRules.id, ruleId))
      } else {
        const [created] = await tx
          .insert(dataPolicyRules)
          .values({
            subjectType,
            subjectId,
            resourceKey: policy.resourceKey,
            action: policy.action,
            scopeType: policy.scopeType,
            inheritToChildren: policy.inheritToChildren,
            createdBy: actorId,
            updatedBy: actorId,
          })
          .returning({ id: dataPolicyRules.id })
        ruleId = created.id
      }
      for (const departmentId of policy.departmentIds) {
        const [assignment] = await tx
          .select({ id: dataPolicyDepartments.id })
          .from(dataPolicyDepartments)
          .where(
            and(
              eq(dataPolicyDepartments.ruleId, ruleId),
              eq(dataPolicyDepartments.departmentId, departmentId),
            ),
          )
          .limit(1)
        if (assignment) {
          await tx
            .update(dataPolicyDepartments)
            .set({
              includeDescendants: policy.includeDescendants,
              isDeleted: false,
              updatedAt: now,
              updatedBy: actorId,
            })
            .where(eq(dataPolicyDepartments.id, assignment.id))
        } else {
          await tx.insert(dataPolicyDepartments).values({
            ruleId,
            departmentId,
            includeDescendants: policy.includeDescendants,
            createdBy: actorId,
            updatedBy: actorId,
          })
        }
      }
    }
  })
  return true
}

export async function resolveDataAccess(
  app: FastifyInstance,
  userId: number,
  resourceKey: string,
  action: DataAction,
): Promise<DataAccessPlan> {
  if (!isRegisteredDataPolicy(resourceKey, action)) {
    return mergeDataAccessPlans([])
  }
  const [assignedRoles, assignedDepartments] = await Promise.all([
    assignedRoleIds(app, userId),
    assignedDepartmentIds(app, userId),
  ])
  const [roleIds, ownDepartmentIds] = await Promise.all([
    enabledRoleIds(app, assignedRoles),
    enabledDepartmentIds(app, assignedDepartments),
  ])
  const ancestorIds = await enabledDepartmentIds(
    app,
    await ancestorDepartmentIds(app, ownDepartmentIds),
  )
  const subjectPredicates = [
    and(eq(dataPolicyRules.subjectType, 'user'), eq(dataPolicyRules.subjectId, userId)),
    roleIds.length
      ? and(eq(dataPolicyRules.subjectType, 'role'), inArray(dataPolicyRules.subjectId, roleIds))
      : undefined,
    ownDepartmentIds.length
      ? and(
          eq(dataPolicyRules.subjectType, 'department'),
          inArray(dataPolicyRules.subjectId, ownDepartmentIds),
        )
      : undefined,
    ancestorIds.length
      ? and(
          eq(dataPolicyRules.subjectType, 'department'),
          inArray(dataPolicyRules.subjectId, ancestorIds),
          eq(dataPolicyRules.inheritToChildren, true),
        )
      : undefined,
  ].filter((item) => item !== undefined)
  if (subjectPredicates.length === 0) {
    return mergeDataAccessPlans([])
  }
  const rules = (await app.db
    .select({
      id: dataPolicyRules.id,
      resourceKey: dataPolicyRules.resourceKey,
      action: dataPolicyRules.action,
      scopeType: dataPolicyRules.scopeType,
    })
    .from(dataPolicyRules)
    .where(
      and(
        eq(dataPolicyRules.resourceKey, resourceKey),
        eq(dataPolicyRules.action, action),
        eq(dataPolicyRules.enabled, true),
        eq(dataPolicyRules.isDeleted, false),
        or(...subjectPredicates),
      ),
    )) as PolicyRow[]
  if (rules.some((rule) => rule.scopeType === 'all')) {
    return mergeDataAccessPlans([{ unrestricted: true, ownerUserIds: [], departmentIds: [] }])
  }

  const resultDepartments: number[] = []
  if (rules.some((rule) => rule.scopeType === 'own_department')) {
    resultDepartments.push(...ownDepartmentIds)
  }
  if (rules.some((rule) => rule.scopeType === 'own_department_tree')) {
    resultDepartments.push(...(await descendantDepartmentIds(app, ownDepartmentIds)))
  }
  const customRuleIds = rules
    .filter((rule) => rule.scopeType === 'custom_departments')
    .map((rule) => rule.id)
  if (customRuleIds.length > 0) {
    const assignments = await app.db
      .select({
        departmentId: dataPolicyDepartments.departmentId,
        includeDescendants: dataPolicyDepartments.includeDescendants,
      })
      .from(dataPolicyDepartments)
      .where(
        and(
          inArray(dataPolicyDepartments.ruleId, customRuleIds),
          eq(dataPolicyDepartments.isDeleted, false),
        ),
      )
    const directIds = await enabledDepartmentIds(
      app,
      assignments.map((row) => row.departmentId),
    )
    const treeIds = assignments
      .filter((row) => row.includeDescendants)
      .map((row) => row.departmentId)
    resultDepartments.push(...directIds, ...(await descendantDepartmentIds(app, treeIds)))
  }

  return mergeDataAccessPlans([
    {
      unrestricted: false,
      ownerUserIds: rules.some((rule) => rule.scopeType === 'self') ? [userId] : [],
      departmentIds: [],
    },
    { unrestricted: false, ownerUserIds: [], departmentIds: resultDepartments },
  ])
}
