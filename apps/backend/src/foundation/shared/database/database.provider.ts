import type { Database } from '@/foundation/database/index.js'

/** Drizzle 客户端没有可用于 Nest 运行时注入的 class，因此使用稳定 token。 */
export const DATABASE = Symbol('database')

export type DatabaseProvider = Database
