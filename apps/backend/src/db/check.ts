import { databaseClient } from './index.js'

// 人工数据库检查同时验证连接、当前 Schema、系统用户表和迁移记录是否可见。
try {
  const [connection] = await databaseClient<
    Array<{
      database: string
      schema: string
      serverVersion: string
      systemUsersTable: string | null
      migrationsTable: string | null
    }>
  >`
    select
      current_database() as database,
      current_schema() as schema,
      current_setting('server_version') as "serverVersion",
      to_regclass('public.sys_users')::text as "systemUsersTable",
      to_regclass('drizzle.__drizzle_migrations')::text as "migrationsTable"
  `

  console.log(
    [
      `PostgreSQL connection succeeded: database=${connection.database}`,
      `schema=${connection.schema}`,
      `version=${connection.serverVersion}`,
      `systemUsersTable=${connection.systemUsersTable ?? 'missing'}`,
      `migrationsTable=${connection.migrationsTable ?? 'missing'}`,
    ].join(', '),
  )
} finally {
  await databaseClient.end()
}
