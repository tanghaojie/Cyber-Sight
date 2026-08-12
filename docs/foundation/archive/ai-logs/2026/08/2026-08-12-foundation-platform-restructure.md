---
title: Forge Foundation/Platform 结构迁移协作记录
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
date: 2026-08-12
status: completed
---

# Forge Foundation/Platform 结构迁移协作记录

## 用户目标和约束

- Forge 是共享脚手架上游，不拥有独立业务功能。
- 统一使用 `forge`、`foundation`、`platform` 表达所有权。
- Foundation 由 Forge 维护，业务平台开发人员只修改 Platform。
- 根 README 由各仓库独立维护；Forge 推广内容不进入业务平台。
- API 契约和数据库也必须区分 Foundation 与 Platform。
- Foundation 的计划、AI 日志和归档随上游同步，保留问题根源；Forge 与 Platform 各有独立历史。
- `docs/templates` 保留为三个作用域共同使用的公共模板。
- Sight 没有业务表、Drizzle migration 或需要保留的数据。

## 关键问答与确认

- 原 `system` 重命名为 `foundation`，原 `biz` 重命名为 `platform`。
- 采用完整所有权分区，不只调整模块目录；共享代码、应用壳、配置和数据库代码也进入 Foundation 或 Platform。
- 数据库允许直接重建空库基线。
- 用户确认完整计划后授权开始执行。

## AI 的重要假设

- 数据库物理 `sys_` 前缀继续保留，仅源码与所有权术语改为 Foundation。
- 本轮先完成 Forge 仓库；Sight 的实际迁移与同步演练需要在其仓库另行执行。
- Platform 跨 Foundation 外键生成以 PoC 结果决定自动或 custom migration。

## 方案和执行摘要

已完成文档、契约、前后端、数据库、Forge 内容和同步工具迁移。前端 Foundation 通过 Platform 注册接口取得品牌、文案、页面和存储命名空间；后端通过根组合入口注入完整数据库、JWT 身份和 PlatformModule。同步工具在共同 Git 历史上执行无提交合并并强制所有权分类。

## 验证结果

- `git diff --cached --quiet`：通过。
- 初始工作区：无已跟踪或未跟踪改动。
- `pnpm docs:archive:check`：`NOT_DUE`。
- API 契约 build 与 dist 导入验证：通过。
- `pnpm architecture:check`：通过，旧目录和 Foundation 反向依赖均未发现。
- Drizzle Platform→Foundation 外键 PoC：只生成 Platform 表和外键，未重复生成 Foundation 表；临时文件已删除。
- `pnpm forge:sync:test`：Platform/README 保留、Forge 排除、未知路径拒绝、验证失败保留未提交 merge 均通过。
- 后端：16 个测试文件、140 个测试通过。
- `pnpm lint`：通过。
- `pnpm build`：API 契约、后端、前端和 `forge/website` 全部通过。
- 前端自动化/浏览器测试未创建或运行，按仓库规则保留人工验收边界。
- 当前环境没有可清空的 PostgreSQL 18 实例，未运行真实空库 migration 与 `test:db`。

## 未决问题与下一步

- Forge 结构稳定后，在 Cyber-Sight 单独执行 Platform 迁移和两次真实同步演练。
- 部署到数据库前使用独立 PostgreSQL 18 空库执行两条 migration 和 `pnpm test:db`。

## 相关设计、ADR、计划和提交

- [所有权边界设计](../../../../design/foundation-platform-ownership.md)
- [所有权 ADR](../../../../decisions/ADR-20260812-foundation-platform-ownership.md)
- [迁移链 ADR](../../../../decisions/ADR-20260812-foundation-platform-migrations.md)
- [实施计划](../../../plans/2026-08-12-foundation-platform-restructure.md)
