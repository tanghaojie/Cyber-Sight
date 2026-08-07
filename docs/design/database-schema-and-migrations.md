---
title: 数据库 Schema 与迁移基线
status: active
owner: project maintainers
updated: 2026-08-05
---

# 数据库 Schema 与迁移基线

## 目标与边界

数据库层使用 PostgreSQL、Drizzle ORM 和受版本控制的 SQL 迁移。当前仓库中的表都是脚手架自带的系统能力表，物理表名统一使用 `sys_` 前缀；TypeScript 表对象继续使用既有语义名称，业务模块不直接拼接物理表名。

`sys_` 只标识应用拥有的框架系统表。PostgreSQL 枚举类型 `menu_type`、`authorization_subject_type`、`data_scope_type` 以及 Drizzle 自有的 `drizzle.__drizzle_migrations` 不属于应用表，不增加该前缀。

## Schema 源码组织

`apps/backend/src/db/schema.ts` 是数据库 Schema 的稳定聚合入口：数据库客户端、Drizzle Kit 和既有调用方均从该文件取得完整 Schema。具体表定义按数据所有权拆分到同级 `schema/` 目录；聚合入口只显式重新导出各分片，不承载表定义，也不使用无差别 barrel。

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

表属外键、唯一约束和显式索引也使用以对应物理表名开头的 `sys_` 名称，便于从数据库对象名直接识别归属。列名、枚举名、模块资源键和 HTTP 契约不因物理表前缀变化。

## 岗位模块扩展（设计阶段）

岗位设计预计新增以下系统表；在代码和迁移实现前，它们不属于当前 15 张应用表，也不应被写入现有 `0000` 初始迁移：

| Drizzle 导出    | PostgreSQL 物理表    | 数据所有者  | 关系                                                                                      |
| --------------- | -------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `positions`     | `sys_positions`      | `positions` | 一个岗位定义绑定一个有效部门；活动编码全局唯一、同部门活动名称唯一。                      |
| `userPositions` | `sys_user_positions` | `positions` | 用户与岗位多对多；岗位所属部门由 `sys_positions.department_id` 推导，不在关系表重复保存。 |

实现岗位模块时必须追加迁移，不能改写已执行的基线；迁移还需要登记 `positions.manage` 权限并为既有超级管理员角色补授该权限。两张表继续复用审计字段、软删除和活动部分唯一索引，完整字段及跨模块约束见[岗位模块](modules/positions.md)。

## 单一初始基线

`apps/backend/drizzle/0000_initial_system_schema.sql` 是初始迁移及其第一个 snapshot，必须一次性创建初始系统 Schema，并写入脚手架运行所需的初始数据：

- 本地管理员、超级管理员角色及角色归属；
- 权限目录、超级管理员功能权限及用户资源全量数据策略；
- 默认部门、闭包自关系及管理员主部门；
- `/sys`、`/config` 两个 `AdminLayout` 根目录、五个相对路径管理菜单及超级管理员的兼容菜单关系；静态首页不写入数据库；
- 通用状态字典。

后续 Schema 变化按正常规则追加新迁移，禁止再次改写已经在共享环境执行过的新基线。`0001_luxuriant_violations` 新增 `sys_api_request_logs` 和 `api_logs.read` 初始授权；只有维护者再次明确宣布基线重置时，才能压缩历史。

## 发布与数据库切换

本次基线不支持旧数据库原地升级，也不提供 `users -> sys_users` 一类重命名或数据复制脚本。开发者和运维必须：

1. 创建全新的空 PostgreSQL 数据库；
2. 将 `DATABASE_URL` 切换到新数据库；
3. 在新数据库执行 `pnpm db:migrate`；
4. 执行 `pnpm test:db`，确认 `public.sys_users` 和 Drizzle 迁移记录存在；
5. 再启动应用并修改默认管理员凭据。

旧数据库只能作为人工备份或离线取数来源，不能继续作为新版应用的迁移目标。需要保留业务数据时，必须另行设计显式 ETL、校验和回滚方案，不得把旧库直接接到新迁移链。

## 失败模式

- 对旧库执行新基线：旧迁移 journal 与新基线不属于同一历史，可能跳过迁移或形成两套表；必须改用空库。
- 只改表名不改初始数据 SQL：迁移会在种子或外键阶段失败；迁移测试必须扫描全部 SQL。
- 漏加表前缀：Schema 测试枚举全部 15 张应用表并校验物理名称。
- 快照、journal 与 SQL 不一致：`pnpm db:generate` 和迁移静态测试必须共同验证初始基线及全部追加迁移。

## 验证策略

- Schema 测试验证全部应用表使用 `sys_` 前缀、表属索引/约束名称一致、审计字段及软删除唯一性不退化。
- 迁移测试验证初始迁移保持不变，追加迁移、snapshot 与 journal 连续一致，最终 DDL/初始数据只引用 `sys_` 应用表。
- `pnpm test`、`pnpm build`、`pnpm lint`、`pnpm format:check` 验证后端、类型和静态质量。
- 有可用空 PostgreSQL 数据库时，在新库执行迁移后运行 `pnpm test:db`；不得用维护者现有数据库代替空库验证。

## 相关决策和实施记录

- [ADR-0026：系统表前缀与全新数据库迁移基线](../decisions/ADR-0026-system-table-prefix-and-fresh-baseline.md)
- [实施计划](../archive/plans/2026-07-30-system-table-prefix-and-migration-baseline.md)
- [AI 协作记录](../archive/ai-logs/2026/07/2026-07-30-system-table-prefix-and-migration-baseline.md)
