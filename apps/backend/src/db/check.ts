import { databaseClient } from './index.js'

// 人工数据库检查同时验证连接、当前 Schema、系统用户表和迁移记录是否可见。
try {
  const [server] = await databaseClient<
    Array<{
      database: string
      schema: string
      serverVersion: string
      serverVersionNumber: number
    }>
  >`
    select
      current_database() as database,
      current_schema() as schema,
      current_setting('server_version') as "serverVersion",
      current_setting('server_version_num')::integer as "serverVersionNumber"
  `
  if (server.serverVersionNumber < 180_000) {
    throw new Error(`PostgreSQL 18 or newer is required; found ${server.serverVersion}`)
  }

  const [schema] = await databaseClient<
    Array<{
      applicationTableCount: number
      identifiersUseUuidV7: boolean
      nullableAuditActorColumnCount: number
      seededRootParentCount: number
      systemUsersTable: string | null
      migrationsTable: string | null
      uuidV7PrimaryKeyCount: number
    }>
  >`
    select
      to_regclass('public.sys_users')::text as "systemUsersTable",
      to_regclass('drizzle.__drizzle_migrations')::text as "migrationsTable",
      (
        select count(*)::integer
        from information_schema.tables
        where table_schema = 'public' and table_name like 'sys\_%' escape '\'
      ) as "applicationTableCount",
      (
        select count(*)::integer
        from information_schema.columns
        where table_schema = 'public'
          and table_name like 'sys\_%' escape '\'
          and column_name = 'id'
          and data_type = 'uuid'
          and column_default = 'uuidv7()'
      ) as "uuidV7PrimaryKeyCount",
      (
        select count(*)::integer
        from information_schema.columns
        where table_schema = 'public'
          and table_name like 'sys\_%' escape '\'
          and column_name in ('created_by', 'updated_by')
          and data_type = 'uuid'
          and is_nullable = 'YES'
      ) as "nullableAuditActorColumnCount",
      (
        (select count(*) from "sys_departments" where "name" = '默认部门' and "parent_id" is not null)
        + (select count(*) from "sys_menus" where "path" in ('/', '/sys', '/config', '/ops', '/about') and "parent_id" is not null)
      )::integer as "seededRootParentCount",
      coalesce((select bool_and(uuid_extract_version("id")::integer = 7) from "sys_users"), false)
        as "identifiersUseUuidV7"
  `
  if (schema.applicationTableCount !== 17 || schema.uuidV7PrimaryKeyCount !== 17) {
    throw new Error('Expected 17 application tables with UUIDv7 primary-key defaults')
  }
  if (schema.nullableAuditActorColumnCount !== 34) {
    throw new Error('Expected nullable UUID audit actor columns on all application tables')
  }
  if (schema.seededRootParentCount !== 0) {
    throw new Error('Department and absolute-path menu roots must use null parents')
  }
  if (!schema.identifiersUseUuidV7) {
    throw new Error('Seeded application identifiers are not UUIDv7 values')
  }

  console.log(
    [
      `PostgreSQL connection succeeded: database=${server.database}`,
      `schema=${server.schema}`,
      `version=${server.serverVersion}`,
      `systemUsersTable=${schema.systemUsersTable ?? 'missing'}`,
      `migrationsTable=${schema.migrationsTable ?? 'missing'}`,
      `applicationTables=${schema.applicationTableCount}`,
      'identifiers=uuidv7',
    ].join(', '),
  )
} finally {
  await databaseClient.end()
}
