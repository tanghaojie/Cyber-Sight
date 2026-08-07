import { and, count, eq, ilike, inArray } from 'drizzle-orm'
import type { PositionRequest } from '@scaffold/api-contract'
import { departments, positions } from '@/db/schema.js'
import type { BackendRuntime } from '@/shared/runtime/backend-runtime.js'
import { auditView, pageOffset } from '@/shared/database/pagination.js'

export interface PositionListQuery {
  pageNum: number
  pageSize: number
  keyword?: string
  departmentId?: number
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

export async function listPositions(app: BackendRuntime, query: PositionListQuery) {
  const keyword = query.keyword?.trim()
  const predicate = and(
    eq(positions.isDeleted, false),
    query.departmentId ? eq(positions.departmentId, query.departmentId) : undefined,
    query.enabled === undefined ? undefined : eq(positions.enabled, query.enabled),
    keyword ? ilike(positions.name, `%${keyword}%`) : undefined,
  )
  const rows = await app.db
    .select()
    .from(positions)
    .where(predicate)
    .orderBy(positions.sortOrder, positions.id)
    .limit(query.pageSize)
    .offset(pageOffset(query))
  const [{ value: total }] = await app.db
    .select({ value: count() })
    .from(positions)
    .where(predicate)
  return { total, list: rows.map(positionSummary) }
}

export async function listPositionOptions(app: BackendRuntime, departmentIds?: number[]) {
  const predicate = and(
    eq(positions.enabled, true),
    eq(positions.isDeleted, false),
    eq(departments.enabled, true),
    eq(departments.isDeleted, false),
    departmentIds?.length ? inArray(positions.departmentId, departmentIds) : undefined,
  )
  const rows = await app.db
    .select({ id: positions.id, departmentId: positions.departmentId, name: positions.name })
    .from(positions)
    .innerJoin(departments, eq(positions.departmentId, departments.id))
    .where(predicate)
    .orderBy(positions.departmentId, positions.sortOrder, positions.id)
  return rows
}

export async function createPosition(
  app: BackendRuntime,
  input: PositionRequest,
  actorId: number,
): Promise<number> {
  const [created] = await app.db
    .insert(positions)
    .values({ ...input, createdBy: actorId, updatedBy: actorId })
    .returning({ id: positions.id })
  return created.id
}

export async function updatePosition(
  app: BackendRuntime,
  id: number,
  input: PositionRequest,
  actorId: number,
): Promise<boolean> {
  const updated = await app.db
    .update(positions)
    .set({ ...input, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
    .returning({ id: positions.id })
  return updated.length > 0
}

export async function softDeletePosition(
  app: BackendRuntime,
  id: number,
  actorId: number,
): Promise<boolean> {
  const deleted = await app.db
    .update(positions)
    .set({ isDeleted: true, updatedAt: new Date(), updatedBy: actorId })
    .where(and(eq(positions.id, id), eq(positions.isDeleted, false)))
    .returning({ id: positions.id })
  return deleted.length > 0
}
