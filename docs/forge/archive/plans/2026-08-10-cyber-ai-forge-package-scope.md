---
title: Cyber AI Forge workspace 包作用域迁移
status: completed
created: 2026-08-10
updated: 2026-08-10
---

# Cyber AI Forge workspace 包作用域迁移

## 目标

将项目当前 workspace 包作用域从 `@scaffold/*` 统一迁移为已拥有的 npm scope `@cyber-ai-forge/*`，使包元数据、源码依赖、脚本和现行文档与正式品牌一致。

## 背景与设计依据

- [CYBER 品牌与视觉系统](../../design/branding.md)
- [ADR-0031：Cyber AI Forge 品牌与项目级技术标识](../../decisions/ADR-0031-cyber-ai-forge-brand.md)
- 用户确认已拥有 npm scope `@cyber-ai-forge`。

## 范围

- `api-contract`、`backend`、`frontend`、`website` 的 package name。
- workspace 依赖、源码导入、根脚本、部署 workflow 和锁文件。
- 现行设计文档、开发指南、ADR、计划和 AI 协作记录。

## 非目标

- 不修改目录名、GitHub URL、HTTP API 路由、数据库、运行时品牌键或业务行为。
- 不改写 `docs/archive/**` 中的历史证据。
- 不新增或运行前端自动化测试。

## 前置条件和风险

- npm scope 已由维护者拥有；本次 workspace 使用不需要发布包。
- 这是内部包标识迁移，所有消费者必须同步更新，否则构建会无法解析 workspace 依赖。
- 若未来公开发布包，还需配置 npm 组织权限和发布策略。

## 实施任务

- [x] 更新当前 ADR 和品牌设计中的作用域决策。
- [x] 更新包元数据、源码导入、脚本、部署配置、锁文件和现行文档。
- [x] 运行格式、归档审计、契约/后端/前端构建与测试。
- [x] 完成计划和 AI 日志，移入归档并更新索引。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm docs:archive:check:ci`
- `pnpm build`
- `pnpm test`
- 搜索确认现行代码和文档不再包含 `@scaffold`，历史归档除外。

## 发布与回滚

本次不发布 npm 包。若需回滚，将作用域引用恢复为迁移前版本，并重新生成锁文件；不涉及数据库或运行时数据回滚。

## 实际偏差和遗留问题

首次构建因本地 workspace 链接仍指向旧包名而失败；运行 `pnpm install` 刷新链接后重跑通过。前端构建保留既有 Sass legacy API、依赖注释和静态/动态导入提示；未运行前端自动化测试，符合项目人工验收边界。

验证结果：`pnpm format`、`pnpm format:check`、`pnpm docs:archive:check:ci`、`pnpm build` 和 `pnpm test` 均通过；后端 14 个测试文件、126 项测试通过。现行代码和文档不再包含旧 scope 引用，迁移记录归档后仅历史文档保留旧 scope。

## 相关设计、ADR 和 AI 日志

- [品牌设计](../../design/branding.md)
- [ADR-0031](../../decisions/ADR-0031-cyber-ai-forge-brand.md)
- [AI 协作记录](../../ai-logs/2026/08/2026-08-10-cyber-ai-forge-package-scope.md)
