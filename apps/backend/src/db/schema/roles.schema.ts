import { boolean, pgTable, serial, varchar } from 'drizzle-orm/pg-core'
import { auditColumns } from './common.schema.js'

// 角色定义与授权关系分表保存；各调用方必须显式按 enabled 与 isDeleted 判断其是否生效。
export const roles = pgTable('sys_roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  description: varchar('description', { length: 200 }).default('').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  ...auditColumns(),
})
