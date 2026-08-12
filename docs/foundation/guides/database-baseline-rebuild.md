# 数据库基线重建指南

## 适用范围

当前 Drizzle 迁移链已重置为单一 UUIDv7 初始基线，全部 17 张脚手架表使用 `sys_` 物理前缀。该基线只支持全新空 PostgreSQL 18 数据库，不支持从旧迁移链原地升级。

## 上线前检查

- 保留旧应用版本和旧 `DATABASE_URL`，将旧数据库作为只读备份；不要删除旧库来“腾出”原名称。
- 为新版应用创建另一个全新空数据库，确认其中没有旧应用表和任何旧 Drizzle migration 记录。
- 若必须保留旧业务数据，停止本流程并单独设计备份、字段映射、ETL、行数与关键约束核对以及回滚方案。

## 重建步骤

1. 在 PostgreSQL 18 中创建新的空数据库，并为应用账号授予建表、建类型和读写权限。
2. 将 `apps/backend/.env` 或部署环境的 `DATABASE_URL` 指向新数据库。
3. 从仓库根执行：

   ```powershell
   pnpm db:migrate
   pnpm test:db
   ```

4. 确认 `pnpm test:db` 输出包含 PostgreSQL 18 版本、`systemUsersTable=sys_users`、`foundationMigrationsTable=drizzle.__foundation_migrations`、`platformMigrationsTable=drizzle.__platform_migrations` 和 `identifiers=uuidv7`。
5. 启动新版应用，使用本地初始管理员完成登录检查，并在共享或生产环境立即修改默认凭据。

## 数据库侧核对

新基线应创建 17 张 `public.sys_*` 表，Drizzle journal 只登记 `0000_initial_uuidv7_foundation_schema` 对应的一次迁移。可由数据库管理员在新库执行只读核对：

```sql
select tablename
from pg_tables
where schemaname = 'public' and tablename like 'sys\_%' escape '\'
order by tablename;

select count(*)
from drizzle.__foundation_migrations;

select count(*)
from drizzle.__platform_migrations;

select uuid_extract_version(id), count(*)
from public.sys_users
group by uuid_extract_version(id);
```

第一条查询应返回 17 行，Foundation migration 查询应返回 `1`，Platform migration 查询应返回 `0`，UUID 查询应只返回版本 `7`。

## 禁止操作

- 不要把旧数据库直接连接到新版应用后执行 `pnpm db:migrate`。
- 不要手工修改旧 journal 来伪装成新基线。
- 不要把旧表改名或复制数据当作临时上线步骤；这需要独立、可验证的数据迁移方案。
- 不要使用 `drizzle-kit push` 绕过迁移基线。

## 回滚

新版切换失败时，停止新版应用并同时切回旧应用版本和旧数据库连接。只回滚代码或只切换数据库都会造成 Schema 与迁移历史不匹配。新数据库可以保留用于排查，不应覆盖旧库。

## 相关设计与决策

- [数据库 Schema 与迁移基线](../design/database-schema-and-migrations.md)
- [ADR-0026](../decisions/ADR-0026-system-table-prefix-and-fresh-baseline.md)
- [ADR-0039](../decisions/ADR-0039-single-uuidv7-identifiers.md)
