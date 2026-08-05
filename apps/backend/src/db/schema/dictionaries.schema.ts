import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, serial, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { auditColumns } from './common.schema.js'

// 字典条目的业务身份是 type + value；label 和 remark 可随展示需求调整而不改变引用值。
export const dictionaries = pgTable(
  'sys_dictionaries',
  {
    id: serial('id').primaryKey(),
    type: varchar('type', { length: 80 }).notNull(),
    label: varchar('label', { length: 80 }).notNull(),
    value: varchar('value', { length: 120 }).notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    remark: varchar('remark', { length: 200 }).default('').notNull(),
    ...auditColumns(),
  },
  (table) => ({
    // 软删除后可复用值，但同一类型下的有效值始终唯一。
    activeEntry: uniqueIndex('sys_dictionaries_type_value_active_unique')
      .on(table.type, table.value)
      .where(sql`${table.isDeleted} = false`),
  }),
)
