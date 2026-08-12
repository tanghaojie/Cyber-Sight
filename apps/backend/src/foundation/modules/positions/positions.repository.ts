import { Inject, Injectable } from '@nestjs/common'
import { and, count, eq, ilike, inArray } from 'drizzle-orm'
import type { EntityId, PositionRequest } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/foundation/database/index.js'
import { departments, positions } from '@/foundation/database/schema.js'
import { DATABASE } from '@/foundation/shared/database/database.provider.js'
import { auditView, pageOffset } from '@/foundation/shared/database/pagination.js'

export interface PositionListQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  departmentId?: EntityId
  enabled?: boolean
}

function positionSummary(row: typeof positions.$inferSelect) {
  return {
    id: row.id,
    departmentId: row.departmentId,
    name: row.name,
    description: row.description,
    sortOrder: row.sortOrder,
    enabled: row.enabled,
    ...auditView(row),
  }
}

@Injectable()
export class PositionsRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async listPositions(query: PositionListQuery) {
    const keyword = query.keyword?.trim()
    const predicate = and(
      eq(positions.isDeleted, false),
      query.departmentId ? eq(positions.departmentId, query.departmentId) : undefined,
      query.enabled === undefined ? undefined : eq(positions.enabled, query.enabled),
      keyword ? ilike(positions.name, `%${keyword}%`) : undefined,
    )
    const rows = await this.db
      .select()
      .from(positions)
      .where(predicate)
      .orderBy(positions.sortOrder, positions.id)
      .limit(query.pageSize)
      .offset(pageOffset(query))
    const [{ value: total }] = await this.db
      .select({ value: count() })
      .from(positions)
      .where(predicate)
    return { total, list: rows.map(positionSummary) }
  }

  async listPositionOptions(departmentIds?: EntityId[]) {
    const predicate = and(
      eq(positions.enabled, true),
      eq(positions.isDeleted, false),
      eq(departments.enabled, true),
      eq(departments.isDeleted, false),
      departmentIds?.length ? inArray(positions.departmentId, departmentIds) : undefined,
    )
    return this.db
      .select({ id: positions.id, departmentId: positions.departmentId, name: positions.name })
      .from(positions)
      .innerJoin(departments, eq(positions.departmentId, departments.id))
      .where(predicate)
      .orderBy(positions.departmentId, positions.sortOrder, positions.id)
  }

  async createPosition(input: PositionRequest, actorId: EntityId): Promise<EntityId> {
    const [created] = await this.db
      .insert(positions)
      .values({ ...input, createdBy: actorId, updatedBy: actorId })
      .returning({ id: positions.id })
    return created.id
  }

  async updatePosition(id: EntityId, input: PositionRequest, actorId: EntityId): Promise<boolean> {
    const updated = await this.db
      .update(positions)
      .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
      .returning({ id: positions.id })
    return updated.length > 0
  }

  async softDeletePosition(id: EntityId, actorId: EntityId): Promise<boolean> {
    const deleted = await this.db
      .update(positions)
      .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
      .returning({ id: positions.id })
    return deleted.length > 0
  }
}
