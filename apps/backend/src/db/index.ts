import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { env } from '@/config/env.js'
import * as schema from './schema.js'

// postgres-js 负责连接，Drizzle 在同一客户端上提供带 Schema 类型的查询接口。
// schema 聚合入口同时供运行时查询和 Drizzle 迁移加载，不能只导入当前模块所需的表。
export const databaseClient = postgres(env.DATABASE_URL)

export const db = drizzle(databaseClient, { schema })
export type Database = typeof db
