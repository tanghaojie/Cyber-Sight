---
title: UUIDv7 标识符与空库基线
status: active
owner: maintainers
updated: 2026-08-10
---

# UUIDv7 标识符与空库基线

## 目标与边界

全部应用表使用单一 UUID 主键，降低顺序标识符被批量枚举的便利性，并避免维护内部 ID 与公开 ID 两套映射。该变化只支持全新 PostgreSQL 18 空库，不提供旧数据库原地升级、双 ID、数字 ID 兼容或数据复制脚本。

UUID 不能替代认证、功能权限和数据范围；资源是否可见和可修改仍由现行授权 Provider 决策。

## 标识符模型

- 17 张 `sys_` 应用表的 `id` 均为 PostgreSQL `uuid`，默认值为原生 `uuidv7()`。
- 所有真实实体引用，包括外键、多态 `subject_id`、审计操作者、日志操作者和授权访问计划，使用同一 UUID 字符串表示。
- `permission_key`、资源键、字典值、请求 ID、令牌摘要和其他稳定业务键保持字符串业务标识，不替换为 UUID。
- 排序值、分页、状态码、HTTP 状态、闭包深度和时长继续使用整数。
- API 契约通过公共 `EntityIdSchema = z.uuid()` 和推导的 `EntityId` 表达持久实体标识，不建立用户、角色等平行品牌类型。

数据库生成 ID，Controller、仓储和前端只传递数据库返回的标准小写 UUID 字符串。应用不在前端生成实体 ID，也不依赖 UUID 中的时间位表达业务时间。

## 空值语义

- 菜单和部门根节点使用 `parentId = null`；禁止用 `0`、空字符串或 nil UUID 表示虚拟根。
- `createdBy`、`updatedBy` 和日志 `actorUserId` 为 nullable UUID。`null` 明确表示系统、启动种子或无法关联到当前用户的历史事件。
- 用户发起的写入继续保存实际用户 UUID；审计列不建立用户外键，避免用户软删除或生命周期变化破坏历史记录。
- 多态授权 `subjectId` 不为空且不建立单列外键，应用继续按 `subjectType` 验证引用。

## 数据库与迁移基线

运行环境最低版本为 PostgreSQL 18，以原生 `uuidv7()` 作为唯一默认生成器。Drizzle Schema 使用 `uuid('id').default(sql\`uuidv7()\`).primaryKey()`；外键和 ID 快照使用 `uuid(...)`。

维护者已明确允许重建空库，因此现行 `0000` 至 `0005` 迁移、journal 和 snapshot 被一条包含最终 17 张表、索引、约束和全部种子的 `0000` 基线取代。新基线只在没有应用表且没有旧 Drizzle 记录的数据库执行；旧库保留为备份或另行 ETL 来源。

种子数据通过业务唯一键和 `RETURNING`/查询获得 UUID，不硬编码环境相关 ID。新迁移链使用新的 journal 时间戳和 SQL 内容，使旧数据库误执行时失败而不是静默伪装成兼容升级。

## 跨层数据流

1. PostgreSQL 在插入时生成 UUIDv7，仓储通过 `returning({ id })` 取得字符串。
2. 共享 Zod 契约对路径、请求、响应和嵌套 ID 执行 UUID 格式校验。
3. Nest Controller 与服务不再做数字 coercion；JWT `sub` 直接保存和校验用户 UUID。
4. 授权模块的用户、角色、部门集合与 `DataAccessPlan` 使用 UUID 字符串数组。
5. Vue 表单、树结构、选择器、路由 URL 和本地用户缓存键原样传递 UUID；根节点只使用 `null`。

## 兼容性和失败模式

- 所有旧数字 ID HTTP 请求都变为非法输入；旧客户端必须与新后端同时发布。
- 旧 JWT 的数字 `sub` 校验失败，空库切换后所有用户必须重新登录。
- 旧浏览器标签页缓存不迁移；用户缓存前缀升级，避免数字用户键和 UUID 用户键混用。
- PostgreSQL 低于 18 时迁移会因缺少 `uuidv7()` 失败；数据库检查必须显式验证主版本。
- 任一残留 `serial`、ID `integer`、数字路径 Schema 或 `0` 根节点都视为基线不完整。

## 验证策略

- Schema 测试枚举 17 张应用表，验证主键、所有实体引用和审计操作者均为 UUID 类型。
- 契约测试验证 UUID 被接受，数字、nil UUID 和任意字符串被拒绝；根节点只接受 `null`。
- 认证测试覆盖 UUID JWT `sub`、缓存命中、数据库回源和撤销。
- 菜单、部门、用户、授权和岗位测试使用 UUID 固定样例覆盖树、关联和数据范围。
- 迁移测试验证只有一条 `0000`、全部 17 张表直接存在、没有 `serial`/实体 ID `integer` 和完整种子。
- 在全新 PostgreSQL 18 数据库运行 `pnpm db:migrate` 与 `pnpm test:db`，再运行全仓测试、构建、lint 和格式检查。

## 相关决策与计划

- [ADR-0039：单一 UUIDv7 标识符与空库基线](../decisions/ADR-0039-single-uuidv7-identifiers.md)
- [已完成实施计划](../archive/plans/2026-08-10-uuidv7-identifier-baseline.md)
