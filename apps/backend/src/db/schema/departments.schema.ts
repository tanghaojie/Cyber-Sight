import { sql } from 'drizzle-orm'
import { boolean, integer, pgTable, serial, uniqueIndex, varchar } from 'drizzle-orm/pg-core'
import { auditColumns } from './common.schema.js'

// 部门邻接表保存直接父子关系，闭包表保存全部祖先路径以加速树范围查询。
export const departments = pgTable('sys_departments', {
  id: serial('id').primaryKey(),
  parentId: integer('parent_id').default(0).notNull(),
  name: varchar('name', { length: 80 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  enabled: boolean('enabled').default(true).notNull(),
  ...auditColumns(),
})

export const departmentClosure = pgTable(
  'sys_department_closure',
  {
    id: serial('id').primaryKey(),
    ancestorId: integer('ancestor_id')
      .notNull()
      .references(() => departments.id),
    descendantId: integer('descendant_id')
      .notNull()
      .references(() => departments.id),
    depth: integer('depth').notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activePath: uniqueIndex('sys_department_closure_path_active_unique')
      .on(table.ancestorId, table.descendantId)
      .where(sql`${table.isDeleted} = false`),
  }),
)
