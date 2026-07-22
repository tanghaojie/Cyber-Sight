import { databaseClient } from './index.js'

try {
  const [connection] = await databaseClient<
    Array<{ database: string; serverVersion: string }>
  >`
    select
      current_database() as database,
      current_setting('server_version') as "serverVersion"
  `

  console.log(
    `PostgreSQL connection succeeded: database=${connection.database}, version=${connection.serverVersion}`
  )
} finally {
  await databaseClient.end()
}
