import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'

/** Foundation 只依赖数据库端口类型；完整 Foundation + Platform Schema 由根组合入口装配。 */
export type Database = PostgresJsDatabase
