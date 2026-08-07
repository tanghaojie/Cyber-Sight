import { Inject, Injectable } from '@nestjs/common'
import { and, eq, inArray } from 'drizzle-orm'
import type { Database } from '@/db/index.js'
import { roles } from '@/db/schema.js'
import { DATABASE } from '@/shared/database/database.provider.js'

// 供用户分配和授权决策复用的最小角色查询，不公开角色管理仓储。
@Injectable()
export class RolesAccess {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async roleExists(roleId: number): Promise<boolean> {
    const [row] = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(and(eq(roles.id, roleId), eq(roles.isDeleted, false)))
      .limit(1)
    return Boolean(row)
  }

  async enabledRoleIds(candidateIds: number[]): Promise<number[]> {
    if (candidateIds.length === 0) {
      return []
    }
    const rows = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(
        and(inArray(roles.id, candidateIds), eq(roles.enabled, true), eq(roles.isDeleted, false)),
      )
    return rows.map((row) => row.id)
  }
}
