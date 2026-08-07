import { and, count, eq, ilike, inArray, or, sql } from 'drizzle-orm'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import type {
  PasswordUpdate,
  PersonalProfile,
  PersonalProfileUpdate,
  UserCreate,
  UserUpdate,
} from '@scaffold/api-contract'
import type { Database } from '@/db/index.js'
import { userDepartments, userRoles, users } from '@/db/schema.js'
import type { DataAccessPlan } from '@/modules/system/authorization/authorization.service.js'
import { auditView, pageOffset, type RepositoryListQuery } from '@/shared/database/pagination.js'
import { hashPassword, verifyPassword } from '@/modules/system/auth/auth.security.js'

type Transaction = Parameters<Parameters<Database['transaction']>[0]>[0]

/** 把授权模块给出的抽象访问计划转换成用户表及部门关联表的查询条件。 */
function userAccessPredicate(plan: DataAccessPlan) {
  if (plan.unrestricted) {
    return undefined
  }
  const predicates = [
    plan.ownerUserIds.length ? inArray(users.id, plan.ownerUserIds) : undefined,
    plan.departmentIds.length
      ? sql<boolean>`${users.id} IN (
          SELECT ${userDepartments.userId}
          FROM ${userDepartments}
          WHERE ${userDepartments.departmentId} IN (${sql.join(
            plan.departmentIds.map((id) => sql`${id}`),
            sql`, `,
          )})
            AND ${userDepartments.isDeleted} = false
        )`
      : undefined,
  ].filter((item) => item !== undefined)
  // 没有任何允许范围时显式返回 false，绝不能因缺少谓词退化为查询全部用户。
  return predicates.length > 0 ? or(...predicates) : sql<boolean>`false`
}

export async function listUsers(
  app: BackendRuntime,
  query: RepositoryListQuery,
  access: DataAccessPlan,
) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(users.isDeleted, false),
    userAccessPredicate(access),
    keyword
      ? or(
          ilike(users.username, `%${keyword}%`),
          ilike(users.displayName, `%${keyword}%`),
          ilike(users.email, `%${keyword}%`),
        )
      : undefined,
  )
  const rows = await app.db
    .select()
    .from(users)
    .where(predicate)
    .orderBy(users.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db.select({ value: count() }).from(users).where(predicate)

  const ids = rows.map((row) => row.id)
  // 当前页的角色和部门一次批量读取，避免为每个用户分别执行关联查询。
  const [roleAssignments, departmentAssignments] = ids.length
    ? await Promise.all([
        app.db
          .select({ userId: userRoles.userId, roleId: userRoles.roleId })
          .from(userRoles)
          .where(and(inArray(userRoles.userId, ids), eq(userRoles.isDeleted, false))),
        app.db
          .select({
            userId: userDepartments.userId,
            departmentId: userDepartments.departmentId,
            isPrimary: userDepartments.isPrimary,
          })
          .from(userDepartments)
          .where(and(inArray(userDepartments.userId, ids), eq(userDepartments.isDeleted, false))),
      ])
    : [[], []]

  return {
    total,
    list: rows.map((row) => ({
      id: row.id,
      username: row.username,
      displayName: row.displayName,
      email: row.email,
      enabled: row.enabled,
      roleIds: roleAssignments.filter((item) => item.userId === row.id).map((item) => item.roleId),
      departmentIds: departmentAssignments
        .filter((item) => item.userId === row.id)
        .map((item) => item.departmentId),
      // 数据库部分唯一索引和写入校验保证每个有效用户有一个主部门，因此此处可安全解包。
      primaryDepartmentId: departmentAssignments.find(
        (item) => item.userId === row.id && item.isPrimary,
      )!.departmentId,
      lastLoginAt: row.lastLoginAt?.toISOString() ?? null,
      ...auditView(row),
    })),
  }
}

async function replaceUserDepartments(
  tx: Transaction,
  userId: number,
  departmentIds: number[],
  primaryDepartmentId: number,
  actorId: number,
): Promise<void> {
  const now = new Date()
  // 先软删除旧集合，再恢复已有关系或新增关系，实现带审计历史的整体替换。
  await tx
    .update(userDepartments)
    .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
    .where(and(eq(userDepartments.userId, userId), eq(userDepartments.isDeleted, false)))
  for (const departmentId of departmentIds) {
    const [existing] = await tx
      .select({ id: userDepartments.id })
      .from(userDepartments)
      .where(
        and(eq(userDepartments.userId, userId), eq(userDepartments.departmentId, departmentId)),
      )
      .limit(1)
    const isPrimary = departmentId === primaryDepartmentId
    if (existing) {
      await tx
        .update(userDepartments)
        .set({ isPrimary, isDeleted: false, updatedAt: now, updatedBy: actorId })
        .where(eq(userDepartments.id, existing.id))
    } else {
      await tx.insert(userDepartments).values({
        userId,
        departmentId,
        isPrimary,
        createdBy: actorId,
        updatedBy: actorId,
      })
    }
  }
}

export async function canAssignUserDepartments(
  app: BackendRuntime,
  departmentIds: number[],
  access: DataAccessPlan,
  targetUserId?: number,
): Promise<boolean> {
  if (access.unrestricted) {
    return true
  }
  const allowed = new Set(access.departmentIds)
  if (departmentIds.every((departmentId) => allowed.has(departmentId))) {
    return true
  }
  if (!targetUserId || !access.ownerUserIds.includes(targetUserId)) {
    return false
  }
  // self 范围可以编辑本人，但不能借编辑操作把用户迁移到原本无权管理的部门。
  const rows = await app.db
    .select({ id: userDepartments.departmentId })
    .from(userDepartments)
    .where(and(eq(userDepartments.userId, targetUserId), eq(userDepartments.isDeleted, false)))
  const existing = new Set(rows.map((row) => row.id))
  return existing.size === departmentIds.length && departmentIds.every((id) => existing.has(id))
}

async function replaceUserRoles(
  tx: Transaction,
  userId: number,
  roleIds: number[],
  actorId: number,
): Promise<void> {
  const now = new Date()
  // 与部门关系使用相同的软删除/恢复策略，防止重复关系并保留审计记录。
  await tx
    .update(userRoles)
    .set({ isDeleted: true, updatedAt: now, updatedBy: actorId })
    .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))

  for (const roleId of roleIds) {
    const [existing] = await tx
      .select({ id: userRoles.id })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.roleId, roleId)))
      .limit(1)
    if (existing) {
      await tx
        .update(userRoles)
        .set({ isDeleted: false, updatedAt: now, updatedBy: actorId })
        .where(eq(userRoles.id, existing.id))
    } else {
      await tx.insert(userRoles).values({
        userId,
        roleId,
        createdBy: actorId,
        updatedBy: actorId,
      })
    }
  }
}

export async function createUser(
  app: BackendRuntime,
  input: UserCreate,
  actorId: number,
): Promise<number> {
  // 密码哈希在事务外完成，缩短数据库事务持锁时间。
  const passwordHash = await hashPassword(input.password)
  return app.db.transaction(async function create(tx) {
    const [created] = await tx
      .insert(users)
      .values({
        username: input.username,
        displayName: input.displayName,
        email: input.email,
        passwordHash,
        enabled: input.enabled,
        createdBy: actorId,
        updatedBy: actorId,
      })
      .returning({ id: users.id })
    await replaceUserRoles(tx, created.id, input.roleIds, actorId)
    await replaceUserDepartments(
      tx,
      created.id,
      input.departmentIds,
      input.primaryDepartmentId,
      actorId,
    )
    return created.id
  })
}

export async function updateUser(
  app: BackendRuntime,
  id: number,
  input: UserUpdate,
  actorId: number,
  access: DataAccessPlan,
): Promise<boolean> {
  const passwordHash = input.password ? await hashPassword(input.password) : undefined
  return app.db.transaction(async function update(tx) {
    // 主记录更新先应用数据范围谓词；未获授权时不会继续改写角色和部门关系。
    const updated = await tx
      .update(users)
      .set({
        displayName: input.displayName,
        email: input.email,
        enabled: input.enabled,
        ...(passwordHash ? { passwordHash } : {}),
        updatedAt: new Date(),
        updatedBy: actorId,
      })
      .where(and(eq(users.id, id), eq(users.isDeleted, false), userAccessPredicate(access)))
      .returning({ id: users.id })
    if (!updated.length) {
      return false
    }
    await replaceUserRoles(tx, id, input.roleIds, actorId)
    await replaceUserDepartments(tx, id, input.departmentIds, input.primaryDepartmentId, actorId)
    return true
  })
}

export async function personalProfileForUser(
  app: BackendRuntime,
  userId: number,
): Promise<PersonalProfile | null> {
  // 个人资料只读取当前用户自己的可编辑字段，角色、部门和状态必须通过管理接口维护。
  const [profile] = await app.db
    .select({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
    })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
    .limit(1)

  return profile ?? null
}

export async function updatePersonalProfile(
  app: BackendRuntime,
  userId: number,
  input: PersonalProfileUpdate,
): Promise<PersonalProfile | null> {
  // enabled 条件避免已禁用账户借持有的旧会话继续修改资料。
  const [profile] = await app.db
    .update(users)
    .set({
      displayName: input.displayName,
      email: input.email,
      updatedAt: new Date(),
      updatedBy: userId,
    })
    .where(and(eq(users.id, userId), eq(users.enabled, true), eq(users.isDeleted, false)))
    .returning({
      id: users.id,
      username: users.username,
      displayName: users.displayName,
      email: users.email,
    })

  return profile ?? null
}

export async function changePersonalPassword(
  app: BackendRuntime,
  userId: number,
  input: PasswordUpdate,
): Promise<'updated' | 'invalid-current-password' | 'not-found'> {
  const [account] = await app.db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(and(eq(users.id, userId), eq(users.enabled, true), eq(users.isDeleted, false)))
    .limit(1)

  if (!account) {
    return 'not-found'
  }
  if (!(await verifyPassword(input.currentPassword, account.passwordHash))) {
    return 'invalid-current-password'
  }

  // 散列在更新前完成，避免数据库写锁覆盖密码派生的耗时工作。
  const passwordHash = await hashPassword(input.newPassword)
  const updated = await app.db
    .update(users)
    .set({ passwordHash, updatedAt: new Date(), updatedBy: userId })
    .where(and(eq(users.id, userId), eq(users.enabled, true), eq(users.isDeleted, false)))
    .returning({ id: users.id })

  return updated.length ? 'updated' : 'not-found'
}

export async function softDeleteUser(
  app: BackendRuntime,
  id: number,
  actorId: number,
  access: DataAccessPlan,
): Promise<boolean> {
  const result = await app.db
    .update(users)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(users.id, id), eq(users.isDeleted, false), userAccessPredicate(access)))
    .returning({ id: users.id })
  return result.length > 0
}
