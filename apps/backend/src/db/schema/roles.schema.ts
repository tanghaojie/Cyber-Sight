import { boolean, pgTable, serial, varchar } from 'drizzle-orm/pg-core'
import { auditColumns } from './common.schema.js'

export const roles = pgTable('sys_roles', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 80 }).notNull(),
  description: varchar('description', { length: 200 }).default('').notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  ...auditColumns(),
})
