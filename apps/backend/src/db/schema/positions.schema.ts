import { sql } from 'drizzle-orm'
import { boolean, index, integer, pgTable, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core'
import { auditColumns, uuidv7PrimaryKey } from './common.schema.js'
import { departments } from './departments.schema.js'
import { users } from './users.schema.js'

export const positions = pgTable(
  'sys_positions',
  {
    id: uuidv7PrimaryKey(),
    departmentId: uuid('department_id')
      .notNull()
      .references(() => departments.id),
    name: varchar('name', { length: 80 }).notNull(),
    description: varchar('description', { length: 200 }).default('').notNull(),
    sortOrder: integer('sort_order').default(0).notNull(),
    enabled: boolean('enabled').default(true).notNull(),
    ...auditColumns(),
  },
  (table) => ({
    activeDepartmentName: uniqueIndex('sys_positions_department_name_active_unique')
      .on(table.departmentId, table.name)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export const userPositions = pgTable(
  'sys_user_positions',
  {
    id: uuidv7PrimaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id),
    positionId: uuid('position_id')
      .notNull()
      .references(() => positions.id),
    ...auditColumns(),
  },
  (table) => ({
    activeAssignment: uniqueIndex('sys_user_positions_user_position_active_unique')
      .on(table.userId, table.positionId)
      .where(sql`${table.isDeleted} = false`),
    userActiveLookup: index('sys_user_positions_user_active_index')
      .on(table.userId)
      .where(sql`${table.isDeleted} = false`),
    positionActiveLookup: index('sys_user_positions_position_active_index')
      .on(table.positionId)
      .where(sql`${table.isDeleted} = false`),
  }),
)

export type Position = typeof positions.$inferSelect
export type NewPosition = typeof positions.$inferInsert
