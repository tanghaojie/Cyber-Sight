import { sql } from 'drizzle-orm'
import { index, integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'
import { auditColumns } from './common.schema.js'

/**
 * 接口日志只追加写入；操作者使用快照字段而非外键，避免用户状态变化破坏历史可读性。
 * `expiresAt` 为 null 的记录由登录审计策略永久保留，其他记录由后台任务物理删除。
 */
export const apiRequestLogs = pgTable(
  'sys_api_request_logs',
  {
    id: serial('id').primaryKey(),
    occurredAt: timestamp('occurred_at', { withTimezone: true }).notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    requestId: varchar('request_id', { length: 100 }).notNull(),
    actorUserId: integer('actor_user_id'),
    actorUsername: varchar('actor_username', { length: 50 }),
    method: varchar('method', { length: 10 }).notNull(),
    routePattern: varchar('route_pattern', { length: 160 }).notNull(),
    httpStatus: integer('http_status').notNull(),
    businessStatus: integer('business_status'),
    durationMs: integer('duration_ms').notNull(),
    ...auditColumns(),
  },
  (table) => ({
    occurredAt: index('sys_api_request_logs_occurred_at_index').on(table.occurredAt),
    expiresAt: index('sys_api_request_logs_expires_at_index')
      .on(table.expiresAt)
      .where(sql`${table.expiresAt} IS NOT NULL`),
    actorOccurredAt: index('sys_api_request_logs_actor_occurred_at_index').on(
      table.actorUserId,
      table.occurredAt,
    ),
    routeOccurredAt: index('sys_api_request_logs_route_occurred_at_index').on(
      table.routePattern,
      table.occurredAt,
    ),
    statusOccurredAt: index('sys_api_request_logs_status_occurred_at_index').on(
      table.httpStatus,
      table.occurredAt,
    ),
  }),
)
