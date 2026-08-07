---
title: 职位迁移 journal 登记修复
date: 2026-08-07
status: completed
---

# 职位迁移 journal 登记修复

## 用户目标和约束

用户报告后端查询 `sys_positions` 时收到 PostgreSQL `relation does not exist`，要求修复。仓库规则要求保留人类修改、先检查暂存区、维护迁移链和文档，并在验证通过后提交。

## 关键问答与确认

- 错误发生在职位选项查询，查询 SQL 与现行 `positions` Schema 一致。
- `0004_positions_management.sql` 已存在，但 `_journal.json` 只包含 `0000` 至 `0003`。
- 因此 Drizzle migration runner 会跳过职位 SQL；首要修复是补登记，而不是修改 repository 查询。
- 归档审计返回 `DUE`，原因是完成事项和 accepted ADR 达到阈值；已创建对应活动计划。

## AI 的重要假设

- 当前数据库应遵守项目的全新数据库基线约定；不为旧库增加隐式兼容逻辑。
- `0004` 是现有迁移链中应执行的最后一条迁移，登记顺序为 `idx: 4`。
- 迁移 SQL 内容本身与现行设计一致，测试应保护“每个 SQL 迁移都被 journal 登记”，避免再次静默漏执行。

## 方案和执行摘要

1. 阅读现行数据库迁移、职位模块设计、相关 ADR 和活动计划索引。
2. 运行暂存区门禁；工作区未发现既有改动。
3. 在首次修改前运行归档审计；沙箱内 Node 权限受限，获准后重跑成功并返回 `DUE`。
4. 创建归档审查计划与本协作日志，随后更新 journal、迁移测试和数据库设计说明。

## 验证结果

已完成：`pnpm format`、`pnpm format:check`、后端 Vitest（14 个文件、125 个测试）、后端构建、`pnpm test:db`、`pnpm db:migrate` 和 `pnpm docs:archive:check:ci` 均通过。迁移器报告 migrations applied successfully；未启动后端 API 做人工端点请求验收。

## 未决问题与下一步

已完成格式、测试、构建、数据库连通性与迁移验证。下一步是归档本计划和日志、更新归档索引/ledger，并提交带真实模型 trailer 的 Git 提交；数据库迁移已在当前配置数据库执行，后端重启后的职位选项人工验收仍由维护者完成。

## 相关设计、ADR、计划和提交

- `docs/design/database-schema-and-migrations.md`
- `docs/design/modules/positions.md`
- `docs/decisions/ADR-0034-position-organization-ownership.md`
- `docs/archive/plans/2026-08-07-position-migration-journal-registration.md`
