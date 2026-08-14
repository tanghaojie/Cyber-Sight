---
title: 职位迁移登记修复与文档归档审查
type: documentation-archive-review
status: completed
created: 2026-08-07
updated: 2026-08-07
---

# 职位迁移登记修复与文档归档审查

## 目标

修复 Drizzle 迁移 journal 漏登记 `0004_positions_management.sql` 导致 `sys_positions` 和 `sys_user_positions` 未创建的问题，并让测试能够阻止同类孤立迁移再次进入仓库。

## 背景与设计依据

- `apps/backend/drizzle/0004_positions_management.sql` 已包含职位相关表、索引、权限和菜单种子数据。
- `apps/backend/drizzle/meta/_journal.json` 当前只登记到 `0003_about_project_menu`，因此 `db:migrate` 不会执行职位迁移。
- `docs/design/database-schema-and-migrations.md` 规定新增 Schema 变化通过追加迁移进入现行迁移链，不改写 `0000` 基线。
- `docs/design/modules/positions.md` 与 `docs/decisions/ADR-0034-position-organization-ownership.md` 将职位表定义为当前系统模块的有效数据边界。

## 范围

- 更新 Drizzle journal，登记现有 `0004_positions_management.sql`。
- 更新后端迁移测试，校验迁移文件与 journal 一一对应，并覆盖职位迁移登记。
- 更新当前数据库设计文档，记录迁移链包含 journal 登记这一可执行要求。
- 完成由归档审计触发的本次计划与协作日志归档。

## 非目标

- 不重写 `0000` 基线，不删除或重命名已有迁移。
- 不修改职位模块的 API、表结构、业务规则或前端验收范围。
- 不执行数据迁移、生产数据库写入或旧数据库兼容迁移。

## 前置条件和风险

- 目标数据库应按项目约定使用全新 PostgreSQL 数据库执行迁移。
- 现有工作区在任务开始时无暂存或未提交改动。
- 迁移 journal 属于 Drizzle 执行元数据；时间戳只需保持迁移顺序，不改变 SQL 语义。

## 实施任务

- [x] 在 journal 中登记 `0004_positions_management`。
- [x] 增加迁移文件与 journal 同步关系的回归测试。
- [x] 更新数据库设计文档并记录实际验证结果。
- [x] 运行格式、后端测试、构建和归档审计；按协议归档本计划与 AI 日志。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm --filter @scaffold/backend test`
- `pnpm --filter @scaffold/backend build`
- `pnpm docs:archive:check:ci`
- 若存在可用的空 PostgreSQL 数据库，再运行 `pnpm test:db`；否则明确记录未执行原因。

## 发布与回滚

发布时提交 journal、测试和当前设计文档；部署后执行 `pnpm db:migrate`。若需要回滚，应恢复代码版本并按数据库运维流程处理已执行迁移，不直接删除迁移记录或表。

## 实际偏差和遗留问题

- 归档审计首次在沙箱内执行时因 Node 访问用户目录受限，获准后重跑成功；不影响仓库结果。
- 原计划中的 `pnpm test:db` 已执行并成功连接 PostgreSQL；项目标准 `pnpm db:migrate` 也已成功应用缺失迁移。未额外运行浏览器或前端自动化测试，符合仓库前端验证边界。
- 未启动后端 API 做端到端请求验证；迁移器成功且静态迁移回归测试通过，人工重启后端后应复验职位选项接口。

## 相关设计、ADR 和 AI 日志

- `docs/design/database-schema-and-migrations.md`
- `docs/design/modules/positions.md`
- `docs/decisions/ADR-0034-position-organization-ownership.md`
- `docs/archive/ai-logs/2026/08/2026-08-07-position-migration-journal-registration.md`
