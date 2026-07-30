import { databaseClient } from './index.js'

// 人工数据库检查同时验证连接、当前 Schema、业务表和迁移记录是否可见。
try {
  const [connection] = await databaseClient<
    Array<{
      database: string
      schema: string
      serverVersion: string
      usersTable: string | null
      migrationsTable: string | null
    }>
  >`
    select
      current_database() as database,
      current_schema() as schema,
      current_setting('server_version') as "serverVersion",
      to_regclass('public.users')::text as "usersTable",
      to_regclass('drizzle.__drizzle_migrations')::text as "migrationsTable"
  `

  console.log(
    [
      `PostgreSQL connection succeeded: database=${connection.database}`,
      `schema=${connection.schema}`,
      `version=${connection.serverVersion}`,
      `usersTable=${connection.usersTable ?? 'missing'}`,
      `migrationsTable=${connection.migrationsTable ?? 'missing'}`,
    ].join(', '),
  )
} finally {
  await databaseClient.end()
}
