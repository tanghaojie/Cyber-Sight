import { and, count, desc, eq, inArray, isNotNull, isNull, lte, gte, sql } from 'drizzle-orm'
import type { FastifyInstance } from 'fastify'
import { apiRequestLogs } from '@/db/schema.js'
import { pageOffset } from '@/shared/database/pagination.js'
import type { ApiLogEvent } from './api-logs.service.js'

const retentionLockId = 529_843_201

export interface NormalizedApiLogQuery {
  pageNum: number
  pageSize: number
  actorUserId?: number
  actorUsername?: string
  method?: string
  routePattern?: string
  httpStatus?: number
  retention?: 'permanent' | 'temporary'
  occurredFrom?: Date
  occurredTo?: Date
}

/** 仅由日志服务调用的批量追加写入，不使用用户事务或外键约束。 */
export async function insertApiLogEvents(
  app: FastifyInstance,
  events: ApiLogEvent[],
): Promise<void> {
  if (events.length === 0) {
    return
  }
  await app.db.insert(apiRequestLogs).values(
    events.map((event) => ({
      occurredAt: event.occurredAt,
      expiresAt: event.expiresAt,
      requestId: event.requestId,
      actorUserId: event.actorUserId,
      actorUsername: event.actorUsername,
      method: event.method,
      routePattern: event.routePattern,
      httpStatus: event.httpStatus,
      businessStatus: event.businessStatus,
      durationMs: event.durationMs,
      createdBy: 0,
      updatedBy: 0,
    })),
  )
}

/**
 * 过期清理使用事务级 advisory lock 串行化多实例执行，并限制每次删除的行数以缩短锁持有时间。
 */
export async function deleteExpiredApiLogs(
  app: FastifyInstance,
  batchSize: number,
): Promise<number> {
  return app.db.transaction(async function deleteWithLock(tx) {
    const [lock] = await tx.execute<{ locked: boolean }>(
      sql`SELECT pg_try_advisory_xact_lock(${retentionLockId}) AS locked`,
    )
    if (!lock?.locked) {
      return 0
    }
    const expired = await tx
      .select({ id: apiRequestLogs.id })
      .from(apiRequestLogs)
      .where(and(isNotNull(apiRequestLogs.expiresAt), lte(apiRequestLogs.expiresAt, new Date())))
      .orderBy(apiRequestLogs.id)
      .limit(batchSize)
    if (expired.length === 0) {
      return 0
    }
    await tx.delete(apiRequestLogs).where(
      inArray(
        apiRequestLogs.id,
        expired.map((row) => row.id),
      ),
    )
    return expired.length
  })
}

/** 管理查询只读取最小日志元数据；保留期字段本身用于区分永久与临时记录。 */
export async function listApiLogs(app: FastifyInstance, query: NormalizedApiLogQuery) {
  const predicate = and(
    eq(apiRequestLogs.isDeleted, false),
    query.actorUserId === undefined ? undefined : eq(apiRequestLogs.actorUserId, query.actorUserId),
    query.actorUsername === undefined
      ? undefined
      : eq(apiRequestLogs.actorUsername, query.actorUsername),
    query.method === undefined ? undefined : eq(apiRequestLogs.method, query.method),
    query.routePattern === undefined
      ? undefined
      : eq(apiRequestLogs.routePattern, query.routePattern),
    query.httpStatus === undefined ? undefined : eq(apiRequestLogs.httpStatus, query.httpStatus),
    query.retention === 'permanent'
      ? isNull(apiRequestLogs.expiresAt)
      : query.retention === 'temporary'
        ? isNotNull(apiRequestLogs.expiresAt)
        : undefined,
    query.occurredFrom === undefined
      ? undefined
      : gte(apiRequestLogs.occurredAt, query.occurredFrom),
    query.occurredTo === undefined ? undefined : lte(apiRequestLogs.occurredAt, query.occurredTo),
  )
  const [rows, [{ value: total }]] = await Promise.all([
    app.db
      .select()
      .from(apiRequestLogs)
      .where(predicate)
      .orderBy(desc(apiRequestLogs.occurredAt), desc(apiRequestLogs.id))
      .limit(query.pageSize)
      .offset(pageOffset(query)),
    app.db.select({ value: count() }).from(apiRequestLogs).where(predicate),
  ])
  return {
    total,
    list: rows.map(function mapApiLog(row) {
      return {
        id: row.id,
        occurredAt: row.occurredAt.toISOString(),
        expiresAt: row.expiresAt?.toISOString() ?? null,
        requestId: row.requestId,
        actorUserId: row.actorUserId,
        actorUsername: row.actorUsername,
        method: row.method,
        routePattern: row.routePattern,
        httpStatus: row.httpStatus,
        businessStatus: row.businessStatus,
        durationMs: row.durationMs,
      }
    }),
  }
}
