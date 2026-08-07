import { Inject, Injectable } from '@nestjs/common'
import { and, count, eq, ilike } from 'drizzle-orm'
import type { RoleRequest } from '@scaffold/api-contract'
import type { Database } from '@/db/index.js'
import { roles } from '@/db/schema.js'
import { DATABASE } from '@/shared/database/database.provider.js'
import { auditView, pageOffset, type RepositoryListQuery } from '@/shared/database/pagination.js'

/** 角色仓储统一过滤软删除记录，并在写操作中维护操作者审计字段。 */
@Injectable()
export class RolesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async listRoles(query: RepositoryListQuery) {
    const keyword = query.keyword?.trim()
    const predicate = and(
      eq(roles.isDeleted, false),
      keyword ? ilike(roles.name, `%${keyword}%`) : undefined,
    )
    const rows = await this.db
      .select()
      .from(roles)
      .where(predicate)
      .orderBy(roles.id)
      .limit(query.pageSize)
      .offset(pageOffset(query))
    const [{ value: total }] = await this.db.select({ value: count() }).from(roles).where(predicate)
    return {
      total,
      list: rows.map((row) => ({
        id: row.id,
        name: row.name,
        description: row.description,
        enabled: row.enabled,
        ...auditView(row),
      })),
    }
  }

  async createRole(input: RoleRequest, actorId: number): Promise<number> {
    const [created] = await this.db
      .insert(roles)
      .values({ ...input, createdBy: actorId, updatedBy: actorId })
      .returning({ id: roles.id })
    return created.id
  }

  async updateRole(id: number, input: RoleRequest, actorId: number): Promise<boolean> {
    const updated = await this.db
      .update(roles)
      .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(roles.id, id), eq(roles.isDeleted, false)))
      .returning({ id: roles.id })
    return updated.length > 0
  }

  async softDeleteRole(id: number, actorId: number): Promise<boolean> {
    const result = await this.db
      .update(roles)
      .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(roles.id, id), eq(roles.isDeleted, false)))
      .returning({ id: roles.id })
    return result.length > 0
  }
}
