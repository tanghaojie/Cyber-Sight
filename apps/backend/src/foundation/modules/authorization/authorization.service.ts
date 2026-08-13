import { Inject, Injectable } from '@nestjs/common'
import { and, eq, inArray, or } from 'drizzle-orm'
import type { Database } from '@/foundation/database/index.js'
import type {
  AuthorizationSubjectType,
  DataAction,
  DataPolicyInput,
  EntityId,
  PermissionSummary,
  SubjectAccessRequest,
} from '@cyber-ai-forge/api-contract'
import {
  dataPolicyDepartments,
  dataPolicyRules,
  permissions,
  rolePermissions,
} from '@/foundation/database/schema.js'
import { DATABASE } from '@/foundation/shared/database/database.provider.js'
import { DepartmentsAccess } from '@/foundation/modules/departments/departments.access.js'
import { RolesAccess } from '@/foundation/modules/roles/roles.access.js'
import { UsersAccess } from '@/foundation/modules/users/users.access.js'
import { isRegisteredDataPolicy } from './authorization.resources.js'

/**
 * 资源仓储消费的中立数据范围。unrestricted 为 false 且两个集合均为空时表示默认拒绝，
 * 仓储必须生成恒假谓词，不能把空集合误解为没有过滤条件。
 */
export interface DataAccessPlan {
  unrestricted: boolean
  ownerUserIds: EntityId[]
  departmentIds: EntityId[]
}

interface PolicyRow {
  id: EntityId
  resourceKey: string
  action: string
  scopeType: DataPolicyInput['scopeType']
}

export type SubjectAccessOperation = 'read' | 'update'

interface DelegationAuthority {
  actorId: EntityId
  permissionKeys: Set<string>
  plans: Map<string, DataAccessPlan>
}

interface DelegationTargetContext {
  userId: EntityId | null
  departmentIds: EntityId[]
}

interface PolicyCoverage {
  plan: DataAccessPlan
  prospectiveSelf: boolean
}

/** 去重时保留首次出现顺序，便于生成稳定的数据访问计划。 */
function unique(values: EntityId[]): EntityId[] {
  return [...new Set(values)]
}

export function mergeDataAccessPlans(plans: DataAccessPlan[]): DataAccessPlan {
  // 多条允许规则按并集合并；任一 all 规则即覆盖其余限制。
  if (plans.some((plan) => plan.unrestricted)) {
    return { unrestricted: true, ownerUserIds: [], departmentIds: [] }
  }
  return {
    unrestricted: false,
    ownerUserIds: unique(plans.flatMap((plan) => plan.ownerUserIds)),
    departmentIds: unique(plans.flatMap((plan) => plan.departmentIds)),
  }
}

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(DATABASE) private readonly db: Database,
    @Inject(DepartmentsAccess)
    private readonly departments: DepartmentsAccess,
    @Inject(RolesAccess)
    private readonly roles: RolesAccess,
    @Inject(UsersAccess)
    private readonly users: UsersAccess,
  ) {}

  async listPermissions(): Promise<PermissionSummary[]> {
    // 权限目录只公开当前可授予的键；已禁用或软删除键不能被新的主体策略引用。
    return this.db
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

  async effectivePermissionKeys(userId: EntityId): Promise<string[]> {
    // 用户权限只由当前有效角色和当前有效权限共同决定。
    const roleIds = await this.roles.enabledRoleIds(await this.users.assignedRoleIds(userId))
    if (roleIds.length === 0) {
      return []
    }
    const rows = await this.db
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

  async hasAnyPermission(userId: EntityId, requiredKeys: readonly string[]): Promise<boolean> {
    if (requiredKeys.length === 0) {
      return false
    }
    const actual = new Set(await this.effectivePermissionKeys(userId))
    return requiredKeys.some((key) => actual.has(key))
  }

  async getSubjectAccess(
    subjectType: AuthorizationSubjectType,
    subjectId: EntityId,
  ): Promise<SubjectAccessRequest> {
    // 功能权限当前只支持角色分配；用户和部门主体只保存数据范围策略。
    const permissionRows =
      subjectType === 'role'
        ? await this.db
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
    const policyRows = await this.db
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
      ? await this.db
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

    // 将规则主表和部门明细重新组合为共享契约中的嵌套策略结构。
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

  async authorizationSubjectExists(
    subjectType: AuthorizationSubjectType,
    subjectId: EntityId,
  ): Promise<boolean> {
    switch (subjectType) {
      case 'user':
        return this.users.userExists(subjectId)
      case 'role':
        return this.roles.roleExists(subjectId)
      case 'department':
        return this.departments.departmentExists(subjectId)
    }
  }

  private async validateSubjectAccess(
    subjectType: AuthorizationSubjectType,
    input: SubjectAccessRequest,
  ): Promise<boolean> {
    // 先校验主体能力和引用完整性，再进入事务，避免写入一部分后才发现输入非法。
    if (subjectType !== 'role' && input.permissionKeys.length > 0) {
      return false
    }
    const uniquePermissionKeys = new Set(input.permissionKeys)
    if (uniquePermissionKeys.size !== input.permissionKeys.length) {
      return false
    }
    if (uniquePermissionKeys.size > 0) {
      const rows = await this.db
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
    const departmentIds: EntityId[] = []
    for (const policy of input.dataPolicies) {
      if (
        !isRegisteredDataPolicy(policy.resourceKey, policy.action, policy.scopeType) ||
        (subjectType !== 'department' && policy.inheritToChildren) ||
        (policy.scopeType !== 'custom_departments' && policy.includeDescendants)
      ) {
        return false
      }
      const identity = `${policy.resourceKey}:${policy.action}:${policy.scopeType}`
      // 同一主体的同资源、动作、范围只能出现一条规则，部门范围放在该规则的明细中。
      if (policyIdentities.has(identity)) {
        return false
      }
      policyIdentities.add(identity)
      departmentIds.push(...policy.departmentIds)
    }
    const uniqueDepartmentIds = unique(departmentIds)
    if (uniqueDepartmentIds.length > 0) {
      const validIds = await this.departments.enabledDepartmentIds(uniqueDepartmentIds)
      if (validIds.length !== uniqueDepartmentIds.length) {
        return false
      }
    }
    return true
  }

  /**
   * 以一个事务整体替换主体的功能权限和数据策略；任一写入失败都不能留下半套授权配置。
   */
  async replaceSubjectAccess(
    subjectType: AuthorizationSubjectType,
    subjectId: EntityId,
    input: SubjectAccessRequest,
    actorId: EntityId,
  ): Promise<boolean> {
    if (!(await this.validateSubjectAccess(subjectType, input))) {
      return false
    }

    await this.db.transaction(async function replaceAccess(tx) {
      const now = new Date()
      if (subjectType === 'role') {
        // 先软删除当前集合，再恢复或新增请求集合，使替换操作和审计历史同时成立。
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

      // 无论输入是否包含策略，都先使当前主规则失效；后续循环只恢复本次请求明确保留的规则。
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
        // 部门明细先失效，随后再失效主规则；整个过程由同一事务保证原子性。
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
        let ruleId: EntityId
        if (existing) {
          // 复用历史软删除记录，避免部分唯一索引和审计历史产生重复身份。
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
          // 旧明细已被统一软删除；这里按规则—部门身份恢复或创建，避免重复活跃关系。
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

  private async delegationAuthority(actorId: EntityId): Promise<DelegationAuthority> {
    return {
      actorId,
      permissionKeys: new Set(await this.effectivePermissionKeys(actorId)),
      plans: new Map(),
    }
  }

  private async authorityPlan(
    authority: DelegationAuthority,
    resourceKey: string,
    action: DataAction,
  ): Promise<DataAccessPlan> {
    const identity = `${resourceKey}:${action}`
    const existing = authority.plans.get(identity)
    if (existing) {
      return existing
    }
    const plan = await this.resolveDataAccess(authority.actorId, resourceKey, action)
    authority.plans.set(identity, plan)
    return plan
  }

  private async userIsWithinPlan(
    userId: EntityId,
    plan: DataAccessPlan,
    knownDepartmentIds?: EntityId[],
  ): Promise<boolean> {
    if (plan.unrestricted || plan.ownerUserIds.includes(userId)) {
      return true
    }
    const departmentIds =
      knownDepartmentIds ??
      (await this.departments.enabledDepartmentIds(await this.users.assignedDepartmentIds(userId)))
    const allowedDepartments = new Set(plan.departmentIds)
    return departmentIds.some((departmentId) => allowedDepartments.has(departmentId))
  }

  private async policyCoverage(
    policy: DataPolicyInput,
    context?: DelegationTargetContext,
  ): Promise<PolicyCoverage | null> {
    if (policy.scopeType === 'all') {
      return {
        plan: { unrestricted: true, ownerUserIds: [], departmentIds: [] },
        prospectiveSelf: false,
      }
    }
    if (policy.scopeType === 'self') {
      if (!context) {
        return null
      }
      return {
        plan: {
          unrestricted: false,
          ownerUserIds: context.userId === null ? [] : [context.userId],
          departmentIds: [],
        },
        prospectiveSelf: context.userId === null,
      }
    }
    if (policy.scopeType === 'own_department') {
      if (!context) {
        return null
      }
      return {
        plan: {
          unrestricted: false,
          ownerUserIds: [],
          departmentIds: [...context.departmentIds],
        },
        prospectiveSelf: false,
      }
    }
    if (policy.scopeType === 'own_department_tree') {
      if (!context) {
        return null
      }
      return {
        plan: {
          unrestricted: false,
          ownerUserIds: [],
          departmentIds: await this.departments.descendantDepartmentIds(context.departmentIds),
        },
        prospectiveSelf: false,
      }
    }

    const directIds = await this.departments.enabledDepartmentIds(policy.departmentIds)
    if (new Set(directIds).size !== new Set(policy.departmentIds).size) {
      return null
    }
    const departmentIds = policy.includeDescendants
      ? unique([...directIds, ...(await this.departments.descendantDepartmentIds(directIds))])
      : directIds
    return {
      plan: { unrestricted: false, ownerUserIds: [], departmentIds },
      prospectiveSelf: false,
    }
  }

  private async coverageIsWithinAuthority(
    coverage: PolicyCoverage,
    authorityPlan: DataAccessPlan,
    context?: DelegationTargetContext,
  ): Promise<boolean> {
    if (authorityPlan.unrestricted) {
      return true
    }
    if (coverage.plan.unrestricted) {
      return false
    }
    const allowedDepartments = new Set(authorityPlan.departmentIds)
    if (coverage.plan.departmentIds.some((departmentId) => !allowedDepartments.has(departmentId))) {
      return false
    }
    for (const userId of coverage.plan.ownerUserIds) {
      if (!(await this.userIsWithinPlan(userId, authorityPlan, context?.departmentIds))) {
        return false
      }
    }
    if (coverage.prospectiveSelf) {
      if (!context || !context.departmentIds.some((id) => allowedDepartments.has(id))) {
        return false
      }
    }
    return true
  }

  private async accessIsDelegable(
    authority: DelegationAuthority,
    access: SubjectAccessRequest,
    context?: DelegationTargetContext,
  ): Promise<boolean> {
    if (access.permissionKeys.some((key) => !authority.permissionKeys.has(key))) {
      return false
    }
    for (const policy of access.dataPolicies) {
      const actorPlan = await this.authorityPlan(
        authority,
        policy.resourceKey,
        policy.action as DataAction,
      )
      const coverage = await this.policyCoverage(policy, context)
      if (!coverage) {
        if (!actorPlan.unrestricted) {
          return false
        }
        continue
      }
      if (!(await this.coverageIsWithinAuthority(coverage, actorPlan, context))) {
        return false
      }
    }
    return true
  }

  private async departmentAccesses(departmentIds: EntityId[]): Promise<SubjectAccessRequest[]> {
    const directIds = unique(departmentIds)
    const directSet = new Set(directIds)
    const ancestorIds = await this.departments.enabledDepartmentIds(
      await this.departments.ancestorDepartmentIds(directIds),
    )
    const accesses: SubjectAccessRequest[] = []
    for (const departmentId of directIds) {
      accesses.push(await this.getSubjectAccess('department', departmentId))
    }
    for (const departmentId of ancestorIds) {
      if (directSet.has(departmentId)) {
        continue
      }
      const access = await this.getSubjectAccess('department', departmentId)
      accesses.push({
        permissionKeys: [],
        dataPolicies: access.dataPolicies.filter((policy) => policy.inheritToChildren),
      })
    }
    return accesses
  }

  private async userAuthorizationContextIsDelegable(
    authority: DelegationAuthority,
    userId: EntityId | null,
    roleIds: EntityId[],
    departmentIds: EntityId[],
    directAccess?: SubjectAccessRequest,
  ): Promise<boolean> {
    const uniqueRoleIds = unique(roleIds)
    const uniqueDepartmentIds = unique(departmentIds)
    const [enabledRoleIds, enabledDepartmentIds] = await Promise.all([
      this.roles.enabledRoleIds(uniqueRoleIds),
      this.departments.enabledDepartmentIds(uniqueDepartmentIds),
    ])
    if (
      enabledRoleIds.length !== uniqueRoleIds.length ||
      enabledDepartmentIds.length !== uniqueDepartmentIds.length
    ) {
      return false
    }

    const context: DelegationTargetContext = {
      userId,
      departmentIds: enabledDepartmentIds,
    }
    const accesses: SubjectAccessRequest[] = [
      directAccess ??
        (userId === null
          ? { permissionKeys: [], dataPolicies: [] }
          : await this.getSubjectAccess('user', userId)),
    ]
    for (const roleId of enabledRoleIds) {
      accesses.push(await this.getSubjectAccess('role', roleId))
    }
    accesses.push(...(await this.departmentAccesses(enabledDepartmentIds)))

    for (const access of accesses) {
      if (!(await this.accessIsDelegable(authority, access, context))) {
        return false
      }
    }
    return true
  }

  async canAccessSubject(
    actorId: EntityId,
    subjectType: AuthorizationSubjectType,
    subjectId: EntityId,
    operation: SubjectAccessOperation,
  ): Promise<boolean> {
    const authority = await this.delegationAuthority(actorId)
    if (subjectType === 'user') {
      const plan = await this.authorityPlan(authority, 'users', operation)
      if (!(await this.userIsWithinPlan(subjectId, plan))) {
        return false
      }
      const [roleIds, departmentIds] = await Promise.all([
        this.roles.enabledRoleIds(await this.users.assignedRoleIds(subjectId)),
        this.departments.enabledDepartmentIds(await this.users.assignedDepartmentIds(subjectId)),
      ])
      return this.userAuthorizationContextIsDelegable(authority, subjectId, roleIds, departmentIds)
    }
    return this.accessIsDelegable(authority, await this.getSubjectAccess(subjectType, subjectId))
  }

  async canDelegateSubjectAccess(
    actorId: EntityId,
    subjectType: AuthorizationSubjectType,
    subjectId: EntityId,
    access: SubjectAccessRequest,
  ): Promise<boolean> {
    const authority = await this.delegationAuthority(actorId)
    if (subjectType === 'user') {
      const [roleIds, departmentIds] = await Promise.all([
        this.roles.enabledRoleIds(await this.users.assignedRoleIds(subjectId)),
        this.departments.enabledDepartmentIds(await this.users.assignedDepartmentIds(subjectId)),
      ])
      return this.userAuthorizationContextIsDelegable(
        authority,
        subjectId,
        roleIds,
        departmentIds,
        access,
      )
    }
    return this.accessIsDelegable(authority, access)
  }

  async canManageUserAuthorizationContext(
    actorId: EntityId,
    targetUserId: EntityId | null,
    roleIds: EntityId[],
    departmentIds: EntityId[],
  ): Promise<boolean> {
    const authority = await this.delegationAuthority(actorId)
    if (targetUserId !== null) {
      const [currentRoleIds, currentDepartmentIds] = await Promise.all([
        this.roles.enabledRoleIds(await this.users.assignedRoleIds(targetUserId)),
        this.departments.enabledDepartmentIds(await this.users.assignedDepartmentIds(targetUserId)),
      ])
      if (
        !(await this.userAuthorizationContextIsDelegable(
          authority,
          targetUserId,
          currentRoleIds,
          currentDepartmentIds,
        ))
      ) {
        return false
      }
    }
    return this.userAuthorizationContextIsDelegable(authority, targetUserId, roleIds, departmentIds)
  }

  async resolveDataAccess(
    userId: EntityId,
    resourceKey: string,
    action: DataAction,
  ): Promise<DataAccessPlan> {
    // 未登记资源默认拒绝全部数据，而不是把“缺少配置”解释为无限制。
    if (!isRegisteredDataPolicy(resourceKey, action)) {
      return mergeDataAccessPlans([])
    }
    const [assignedRoles, assignedDepartments] = await Promise.all([
      this.users.assignedRoleIds(userId),
      this.users.assignedDepartmentIds(userId),
    ])
    const [roleIds, ownDepartmentIds] = await Promise.all([
      this.roles.enabledRoleIds(assignedRoles),
      this.departments.enabledDepartmentIds(assignedDepartments),
    ])
    const ancestorIds = await this.departments.enabledDepartmentIds(
      await this.departments.ancestorDepartmentIds(ownDepartmentIds),
    )
    const subjectPredicates = [
      // 允许来源包括用户本人、有效角色、直属部门，以及声明向子部门继承的祖先部门。
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
    // 仅查询与当前资源和动作精确匹配的有效规则，策略不会在未登记资源之间隐式复用。
    const rules = (await this.db
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

    const resultDepartments: EntityId[] = []
    // 各条策略按 allow 并集合并，不存在显式 deny；树范围通过部门闭包表展开。
    if (rules.some((rule) => rule.scopeType === 'own_department')) {
      resultDepartments.push(...ownDepartmentIds)
    }
    if (rules.some((rule) => rule.scopeType === 'own_department_tree')) {
      resultDepartments.push(...(await this.departments.descendantDepartmentIds(ownDepartmentIds)))
    }
    const customRuleIds = rules
      .filter((rule) => rule.scopeType === 'custom_departments')
      .map((rule) => rule.id)
    if (customRuleIds.length > 0) {
      const assignments = await this.db
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
      const directIds = await this.departments.enabledDepartmentIds(
        assignments.map((row) => row.departmentId),
      )
      const treeIds = assignments
        .filter((row) => row.includeDescendants)
        .map((row) => row.departmentId)
      resultDepartments.push(
        ...directIds,
        ...(await this.departments.descendantDepartmentIds(treeIds)),
      )
    }

    // 最终计划把记录所有者约束和部门约束分开，交由资源仓储转成查询谓词。
    return mergeDataAccessPlans([
      {
        unrestricted: false,
        ownerUserIds: rules.some((rule) => rule.scopeType === 'self') ? [userId] : [],
        departmentIds: [],
      },
      { unrestricted: false, ownerUserIds: [], departmentIds: resultDepartments },
    ])
  }
}
