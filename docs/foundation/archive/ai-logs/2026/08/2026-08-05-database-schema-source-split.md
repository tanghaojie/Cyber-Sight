---
title: 数据库 Schema 源码拆分
date: 2026-08-05
status: completed
---

# 数据库 Schema 源码拆分

## 用户目标和约束

用户要求拆分随数据表增加而膨胀的 `apps/backend/src/db/schema.ts`，先审阅计划后已确认实施。必须保持现有数据库行为，并遵守仓库的文档、验证和自动提交门禁。

## 关键问答与确认

- 2026-08-05：已提供按数据所有权拆分、稳定聚合入口和无 DDL 变更的计划。
- 2026-08-05：用户确认开始实施。

## AI 的重要假设

- 这是源码组织重构，不改变任何数据库对象，因此不应新增迁移。
- `src/db/schema.ts` 仍是业务调用、数据库客户端与 Drizzle Kit 的稳定入口。
- 当前工具链历史上存在 NodeNext 跨文件 Schema 解析限制，必须以实际迁移生成结果验证。

## 方案和执行摘要

开始前已确认暂存区为空。已将共享审计列和枚举、users、roles、departments、authorization、menus、auth、dictionaries、api-logs 拆为 9 个分片；稳定入口显式重新导出全部现有运行时符号和 users 类型，业务调用方无需改动。

## 验证结果

`drizzle-kit@0.23.2` 无法解析稳定入口中的跨文件 `.js` 导入，已按计划升级到 `drizzle-orm@0.45.2` 和 `drizzle-kit@0.31.10`。升级后 `pnpm db:generate` 成功识别 15 张表并报告无 Schema 变化。`pnpm format`、`pnpm test`（112 项通过）、`pnpm build`、`pnpm lint`、`pnpm format:check` 全部通过；`drizzle/` 无变更。

## 未决问题与下一步

无未决问题。

## 相关设计、ADR、计划和提交

- [数据库 Schema 与迁移基线](../../../../design/database-schema-and-migrations.md)
- [后端模块设计](../../../../design/modules/backend.md)
- [实施计划](../../../plans/2026-08-05-database-schema-source-split.md)
