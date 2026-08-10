import { Inject, Injectable } from '@nestjs/common'
import { and, eq } from 'drizzle-orm'
import type { EntityId } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/db/index.js'
import { userDepartments, userRoles, users } from '@/db/schema.js'
import { DATABASE } from '@/shared/database/database.provider.js'

// 向授权等模块公开只读访问查询，调用方无需依赖用户模块的仓储实现细节。
@Injectable()
export class UsersAccess {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async userExists(userId: EntityId): Promise<boolean> {
    const [row] = await this.db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, userId), eq(users.isDeleted, false)))
      .limit(1)
    return Boolean(row)
  }

  async assignedRoleIds(userId: EntityId): Promise<EntityId[]> {
    const rows = await this.db
      .select({ id: userRoles.roleId })
      .from(userRoles)
      .where(and(eq(userRoles.userId, userId), eq(userRoles.isDeleted, false)))
    return rows.map((row) => row.id)
  }

  async assignedDepartmentIds(userId: EntityId): Promise<EntityId[]> {
    const rows = await this.db
      .select({ id: userDepartments.departmentId })
      .from(userDepartments)
      .where(and(eq(userDepartments.userId, userId), eq(userDepartments.isDeleted, false)))
    return rows.map((row) => row.id)
  }

  async hasActiveDepartmentMembership(departmentId: EntityId): Promise<boolean> {
    const [row] = await this.db
      .select({ id: userDepartments.id })
      .from(userDepartments)
      .where(
        and(eq(userDepartments.departmentId, departmentId), eq(userDepartments.isDeleted, false)),
      )
      .limit(1)
    return Boolean(row)
  }
}
