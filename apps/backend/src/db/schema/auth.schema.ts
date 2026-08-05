import { integer, pgTable, serial, timestamp, varchar } from 'drizzle-orm/pg-core'
import { auditColumns } from './common.schema.js'
import { users } from './users.schema.js'

// 会话表只保存令牌摘要；JWT 原文仅返回调用方并短期驻留内存缓存。
// tokenHash 全局唯一，使同一令牌不会被重复持久化成多个可独立撤销的会话记录。
export const authSessions = pgTable('sys_auth_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  tokenHash: varchar('token_hash', { length: 64 }).notNull().unique(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  ...auditColumns(),
})
