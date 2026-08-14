---
title: 数据库 Schema 源码拆分
status: completed
created: 2026-08-05
updated: 2026-08-05
---

# 数据库 Schema 源码拆分

## 目标

将后端单体 `src/db/schema.ts` 拆分为按数据所有权组织的 Schema 分片，同时保持 PostgreSQL 对象、公共导出和既有业务调用不变。

## 背景与设计依据

当前 Schema 包含 15 张系统表、3 个 PostgreSQL 枚举和共享审计列。数据库客户端、Drizzle Kit、9 个后端系统模块及 Schema 测试都从稳定入口 `src/db/schema.ts` 使用这些定义。设计见[数据库 Schema 与迁移基线](../../design/database-schema-and-migrations.md)和[后端模块设计](../../design/modules/backend.md)。

## 范围

- 新增 `src/db/schema/`，按 users、roles、departments、authorization、menus、auth、dictionaries、api-logs 及共享基础能力拆分定义。
- 保留 `src/db/schema.ts` 作为显式聚合入口，保持所有现有导入路径和导出符号稳定。
- 补充 Schema 聚合完整性测试，并验证迁移生成不产生 DDL 变化。

## 非目标

- 不调整表、列、枚举、外键、索引、软删除语义或初始数据。
- 不修改既有 SQL migration、snapshot 或 journal。
- 不将表定义迁入业务模块目录，也不重构仓储调用方。

## 前置条件和风险

- Drizzle Kit 必须能加载 NodeNext 下跨文件的 `.js` Schema 导入。若当前 `drizzle-kit` 0.23 无法生成，先将它与兼容的 `drizzle-orm` 升级并重新验证，再继续拆分。
- 生成命令可能写入 migration 输出；只有确认生成结果为空时才保留工作区变更，出现 DDL 差异即停止并调查。

## 实施任务

- [x] 建立并验证多文件 Schema 的 Drizzle 工具链兼容性。
- [x] 拆分共享定义和各数据所有权分片，建立稳定聚合入口。
- [x] 更新 Schema 测试，确保所有表仍从聚合入口可得。
- [x] 完成格式、测试、构建、静态检查与无 DDL 差异验证。
- [x] 更新实施记录并归档计划、AI 日志。

## 测试与验证

- `pnpm format`、`pnpm test`、`pnpm build`、`pnpm lint`、`pnpm format:check`。
- `pnpm db:generate` 不得新增或修改 migration、snapshot、journal。

## 发布与回滚

这是无 DDL 的源码重构，可通过还原 Schema 分片和聚合入口回滚；不涉及数据库回滚。

## 实际偏差和遗留问题

初始 `drizzle-kit@0.23.2` 复现了 NodeNext 跨文件 `.js` Schema 导入失败。为实现计划中的兼容性前置条件，已将 `drizzle-orm` 升级至 `0.45.2`、`drizzle-kit` 升级至 `0.31.10`；升级后迁移生成成功识别 15 张表，并报告无 Schema 变化。未新增或修改 SQL migration、snapshot、journal；无遗留问题。

## 相关设计、ADR 和 AI 日志

- [数据库 Schema 与迁移基线](../../design/database-schema-and-migrations.md)
- [后端模块设计](../../design/modules/backend.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-05-database-schema-source-split.md)
