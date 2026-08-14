# Platform migrations

Sight 当前没有业务表，也没有需要保留的 Drizzle migration。本目录是 Platform 独立迁移链的空基线。

新增业务表时，先在 `src/platform/database/schema/` 建立 Schema 分片并由
`src/platform/database/schema.ts` 显式导出，再运行 `pnpm db:platform:generate`。Platform migration
不得修改 Foundation 拥有的表；跨所有权外键必须先完成生成结果审查。
