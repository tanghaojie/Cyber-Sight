import { and, count, eq, ilike, or } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import type { DictionaryRequest } from '@scaffold/api-contract'
import { dictionaries } from '@/db/schema.js'
import { auditView, pageOffset, type RepositoryListQuery } from '@/shared/database/pagination.js'

export async function listDictionaries(app: FastifyInstance, query: RepositoryListQuery) {
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
  const rows = await app.db
    .select()
    .from(dictionaries)
    .where(predicate)
    .orderBy(dictionaries.type, dictionaries.sortOrder, dictionaries.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db
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

export async function createDictionary(
  app: FastifyInstance,
  input: DictionaryRequest,
  actorId: number,
): Promise<number> {
  const [created] = await app.db
    .insert(dictionaries)
    .values({ ...input, createdBy: actorId, updatedBy: actorId })
    .returning({ id: dictionaries.id })
  return created.id
}

export async function updateDictionary(
  app: FastifyInstance,
  id: number,
  input: DictionaryRequest,
  actorId: number,
): Promise<boolean> {
  const result = await app.db
    .update(dictionaries)
    .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(dictionaries.id, id), eq(dictionaries.isDeleted, false)))
    .returning({ id: dictionaries.id })
  return result.length > 0
}

export async function softDeleteDictionary(
  app: FastifyInstance,
  id: number,
  actorId: number,
): Promise<boolean> {
  const result = await app.db
    .update(dictionaries)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(dictionaries.id, id), eq(dictionaries.isDeleted, false)))
    .returning({ id: dictionaries.id })
  return result.length > 0
}
