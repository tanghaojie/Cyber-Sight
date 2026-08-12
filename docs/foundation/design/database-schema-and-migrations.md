---
title: 数据库 Schema 与迁移基线
status: active
owner: project maintainers
updated: 2026-08-12
---

# 数据库 Schema 与迁移基线

## 目标与边界

数据库层使用 PostgreSQL 18、Drizzle ORM 和受版本控制的 SQL 迁移。当前仓库中的表都是脚手架自带的系统能力表，物理表名统一使用 `sys_` 前缀；TypeScript 表对象继续使用既有语义名称，业务模块不直接拼接物理表名。全部应用表以数据库原生 `uuidv7()` 生成单一 `uuid` 主键，实体引用也统一为 `uuid`。

`sys_` 只标识应用拥有的框架系统表。PostgreSQL 枚举类型 `menu_type`、`authorization_subject_type`、`data_scope_type` 以及 Drizzle 自有的 `drizzle.__foundation_migrations`、`drizzle.__platform_migrations` 不属于应用表，不增加该前缀。

## Schema 源码组织

`apps/backend/src/foundation/database/schema.ts` 聚合 Forge 维护的基础表，`apps/backend/src/platform/database/schema.ts` 聚合当前业务平台拥有的表。根 `apps/backend/src/database.schema.ts` 只负责按 Foundation、Platform 顺序组合运行时完整 Schema；数据库客户端在根 `database.ts` 创建后通过 Nest Provider 注入 Foundation，避免 Foundation 反向导入 Platform。

两个作用域的具体表定义分别放入自身 `schema/` 目录，聚合入口只显式重新导出分片，不承载表定义，也不使用无差别 barrel。Platform 可以显式引用 Foundation 公共表建立外键，Foundation Schema 禁止引用 Platform。

分片之间可以为外键显式导入被引用的表，但不得改变导出的表对象、枚举、列、约束或索引。纯源码组织重构不生成 SQL migration，不改写既有 migration、snapshot 或 journal；只有数据库对象发生语义变化时才追加迁移。

## 物理表映射

| Drizzle 导出            | PostgreSQL 物理表             |
| ----------------------- | ----------------------------- |
| `users`                 | `sys_users`                   |
| `roles`                 | `sys_roles`                   |
| `userRoles`             | `sys_user_roles`              |
| `departments`           | `sys_departments`             |
| `departmentClosure`     | `sys_department_closure`      |
| `userDepartments`       | `sys_user_departments`        |
| `permissions`           | `sys_permissions`             |
| `rolePermissions`       | `sys_role_permissions`        |
| `menus`                 | `sys_menus`                   |
| `roleMenus`             | `sys_role_menus`              |
| `dictionaries`          | `sys_dictionaries`            |
| `dataPolicyRules`       | `sys_data_policy_rules`       |
| `dataPolicyDepartments` | `sys_data_policy_departments` |
| `authSessions`          | `sys_auth_sessions`           |
| `apiRequestLogs`        | `sys_api_request_logs`        |
| `positions`             | `sys_positions`               |
| `userPositions`         | `sys_user_positions`          |

表属外键、唯一约束和显式索引也使用以对应物理表名开头的 `sys_` 名称，便于从数据库对象名直接识别归属。列名、枚举名、模块资源键和 HTTP 契约不因物理表前缀变化。

## 岗位模块扩展（已实施）

岗位模块拥有以下两张系统表，当前应用表总数为 17 张；它们与其余系统表一起直接存在于当前单一 `0000` 空库基线：

| Drizzle 导出    | PostgreSQL 物理表    | 数据所有者  | 关系                                                                                      |
| --------------- | -------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `positions`     | `sys_positions`      | `positions` | 一个岗位定义绑定一个有效部门；同部门活动岗位名称唯一。                                    |
| `userPositions` | `sys_user_positions` | `positions` | 用户与岗位多对多；岗位所属部门由 `sys_positions.department_id` 推导，不在关系表重复保存。 |

基线同时登记 `positions.manage`、`home.read`、岗位管理菜单、默认 `/` 工作台和超级管理员授权。两张岗位表复用 UUIDv7 主键、可空 UUID 审计操作者、软删除、外键和活动部分唯一索引，完整字段及跨模块约束见[岗位模块](modules/positions.md)。迁移 SQL 文件必须与 journal 条目一一对应，避免文件存在但 `db:migrate` 静默跳过。

## 单一初始基线

`apps/backend/drizzle/foundation/0000_initial_uuidv7_foundation_schema.sql` 是当前唯一迁移，并与 `0000_snapshot.json`、journal 的唯一条目对应。它只面向 PostgreSQL 18 空库，必须一次性创建 17 张系统表及脚手架运行所需的初始数据：

- 本地管理员、超级管理员角色及角色归属；
- 权限目录、超级管理员功能权限及用户资源全量数据策略；
- 默认部门、闭包自关系及管理员主部门；
- `/`、`/sys`、`/config`、`/ops`、`/about` 根节点、七个相对路径管理菜单及超级管理员菜单关系；
- 通用状态字典。

全部 17 个主键由 `uuidv7()` 生成；关系列使用 `uuid`；部门和菜单根节点使用 `parent_id = NULL`；没有登录主体的系统审计使用 `created_by = NULL`、`updated_by = NULL`。后续 Schema 变化按正常规则追加新迁移，禁止改写已经在共享环境执行过的新基线；只有维护者再次明确宣布基线重置时，才能压缩历史。

## 独立迁移链

- `drizzle.foundation.config.ts` 使用 Foundation Schema、`drizzle/foundation/` 和 `drizzle.__foundation_migrations`。
- `drizzle.platform.config.ts` 使用 Platform Schema、`drizzle/platform/` 和 `drizzle.__platform_migrations`。
- `pnpm db:migrate` 固定先执行 Foundation，再执行 Platform；也可分别运行 `db:foundation:*` 与 `db:platform:*`。
- Sight 当前没有业务表和业务 migration，因此 `drizzle/platform/` 只保留空基线说明，不伪造 SQL、snapshot 或 journal。

临时外键 PoC 使用一张未提交的 Platform 表引用 `sys_users.id`。Drizzle Kit 0.31.10 只生成该 Platform 表和外键，没有重复生成 Foundation 表，因此当前允许自动生成 Platform migration；每次引入新的跨作用域关系仍必须审查生成 SQL。

## 发布与数据库切换

本次基线不支持旧数据库原地升级，也不提供 `users -> sys_users` 一类重命名或数据复制脚本。开发者和运维必须：

1. 创建全新的空 PostgreSQL 18 数据库；
2. 将 `DATABASE_URL` 切换到新数据库；
3. 在新数据库执行 `pnpm db:migrate`；
4. 执行 `pnpm test:db`，确认服务端版本、`public.sys_users`、Drizzle 迁移记录和种子 UUIDv7；
5. 再启动应用并修改默认管理员凭据。

旧数据库只能作为人工备份或离线取数来源，不能继续作为新版应用的迁移目标。需要保留业务数据时，必须另行设计显式 ETL、校验和回滚方案，不得把旧库直接接到新迁移链。

## 失败模式

- 对 PostgreSQL 18 以下版本执行基线：数据库不存在原生 `uuidv7()`，初始化会失败；必须升级服务端。
- 对旧库执行新基线：旧迁移 journal 与新基线不属于同一历史，可能跳过迁移或形成两套表；必须改用空库。
- 只改表名不改初始数据 SQL：迁移会在种子或外键阶段失败；迁移测试必须扫描全部 SQL。
- 漏加表前缀：Schema 测试枚举全部 17 张应用表并校验物理名称。
- 快照、journal 与 SQL 不一致：迁移静态测试必须验证当前只有一条 `0000`、一个 snapshot 和一个 journal 条目；未来追加迁移必须沿用现有项目约定并明确记录。

## 验证策略

- Schema 测试验证全部应用表使用 `sys_` 前缀、表属索引/约束名称一致、审计字段及软删除唯一性不退化。
- 迁移测试验证单一基线直接包含全部 17 张表、UUIDv7 默认值、UUID 关系、`NULL` 根节点、可空审计主体和完整种子，且不存在 `serial` 或整数实体引用。
- `pnpm test`、`pnpm build`、`pnpm lint`、`pnpm format:check` 验证后端、类型和静态质量。
- 有可用空 PostgreSQL 18 数据库时，在新库执行迁移后运行 `pnpm test:db`；不得用维护者现有数据库代替空库验证。

## 相关决策和实施记录

- [ADR-0026：系统表前缀与全新数据库迁移基线](../decisions/ADR-0026-system-table-prefix-and-fresh-baseline.md)
- [ADR-0039：单一 UUIDv7 标识符](../decisions/ADR-0039-single-uuidv7-identifiers.md)
- [实施计划](../archive/plans/2026-07-30-system-table-prefix-and-migration-baseline.md)
- [AI 协作记录](../archive/ai-logs/2026/07/2026-07-30-system-table-prefix-and-migration-baseline.md)
