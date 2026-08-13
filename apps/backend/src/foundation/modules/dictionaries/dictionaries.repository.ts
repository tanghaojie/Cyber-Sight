import { Inject, Injectable } from '@nestjs/common'
import { and, count, eq, ilike, or } from 'drizzle-orm'
import type { DictionaryRequest, EntityId } from '@cyber-ai-forge/api-contract'
import type { Database } from '@/foundation/database/index.js'
import { dictionaries } from '@/foundation/database/schema.js'
import { DATABASE } from '@/foundation/shared/database/database.provider.js'
import {
  auditView,
  pageOffset,
  type RepositoryListQuery,
} from '@/foundation/shared/database/pagination.js'

/** 字典仓储按 type、sortOrder、id 稳定排序，并统一过滤软删除记录。 */
@Injectable()
export class DictionariesRepository {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async listDictionaries(query: RepositoryListQuery) {
    const keyword = query.keyword?.trim()
    const predicate = and(
      eq(dictionaries.isDeleted, false),
      keyword
        ? or(
            ilike(dictionaries.type, `%${keyword}%`),
            ilike(dictionaries.label, `%${keyword}%`),
            ilike(dictionaries.value, `%${keyword}%`),
          )
        : undefined,
    )
    const rows = await this.db
      .select()
      .from(dictionaries)
      .where(predicate)
      .orderBy(dictionaries.type, dictionaries.sortOrder, dictionaries.id)
      .limit(query.pageSize)
      .offset(pageOffset(query))
    const [{ value: total }] = await this.db
      .select({ value: count() })
      .from(dictionaries)
      .where(predicate)
    return {
      total,
      list: rows.map((row) => ({
        id: row.id,
        type: row.type,
        label: row.label,
        value: row.value,
        sortOrder: row.sortOrder,
        enabled: row.enabled,
        remark: row.remark,
        ...auditView(row),
      })),
    }
  }

  async createDictionary(input: DictionaryRequest, actorId: EntityId): Promise<EntityId> {
    const [created] = await this.db
      .insert(dictionaries)
      .values({ ...input, createdBy: actorId, updatedBy: actorId })
      .returning({ id: dictionaries.id })
    return created.id
  }

  async updateDictionary(
    id: EntityId,
    input: DictionaryRequest,
    actorId: EntityId,
  ): Promise<boolean> {
    const result = await this.db
      .update(dictionaries)
      .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(dictionaries.id, id), eq(dictionaries.isDeleted, false)))
      .returning({ id: dictionaries.id })
    return result.length > 0
  }

  async softDeleteDictionary(id: EntityId, actorId: EntityId): Promise<boolean> {
    const result = await this.db
      .update(dictionaries)
      .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
      .where(and(eq(dictionaries.id, id), eq(dictionaries.isDeleted, false)))
      .returning({ id: dictionaries.id })
    return result.length > 0
  }
}
