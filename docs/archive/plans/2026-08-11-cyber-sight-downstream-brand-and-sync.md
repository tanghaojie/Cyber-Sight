---
title: Cyber-Sight 下游品牌与上游同步治理
status: completed
created: 2026-08-11
updated: 2026-08-11
---

# Cyber-Sight 下游品牌与上游同步治理

## 目标

为 Cyber-Sight 配置安全的双远端行为，建立人类与 AI 共用的 Cyber AI Forge 更新流程，并把产品可见品牌迁移为 Cyber-Sight，同时保留上游技术兼容标识。

## 背景与设计依据

Cyber-Sight 与 Cyber AI Forge 保留共同 Git 历史，但不是 GitHub fork。任务开始时 `upstream` 仍可推送、`master` 没有跟踪分支，产品公开入口继续显示 Cyber AI Forge。实施遵循 [上游同步设计](../../design/upstream-synchronization.md)和 [Cyber-Sight 下游身份 ADR](../../decisions/ADR-20260811-cyber-sight-downstream-identity.md)。

## 范围

- 仓库级 Git 安全配置和验证。
- 上游同步设计、人类指南与 AI 规则。
- README、运行时界面、Swagger、推广站和现行品牌文档。
- 相关设计、ADR、索引、计划与 AI 协作记录归档。

## 非目标

- 不修改 Cyber AI Forge 远端仓库或 GitHub 分支保护设置。
- 不重命名 workspace 包、JWT、浏览器存储键、数据库或 API。
- 不发明尚未确认的 Cyber-Sight 具体业务能力。
- 不创建或运行前端自动化、组件或浏览器测试。

## 前置条件和风险

- 开始时暂存区和工作区为空；`pnpm docs:archive:check` 返回 `NOT_DUE`。
- 品牌文件会成为 Cyber-Sight 下游拥有内容，未来同步需要人工审查。
- 当前本地 `master` 已包含尚未推送到 `origin` 的上游合并提交，本任务不得改写该历史。

## 实施任务

- [x] 检查 Git 门禁、现行设计、相关 ADR 和归档状态。
- [x] 建立下游身份、品牌边界和上游同步设计。
- [x] 应用并验证仓库级 Git 安全配置。
- [x] 迁移产品可见品牌、公开 URL 和 README。
- [x] 补充人类同步指南与 `AGENTS.md` AI 协议。
- [x] 更新最终设计、归档被取代 ADR、计划和 AI 日志。
- [x] 完成格式、Lint、测试、构建、归档 CI 检查和人工验收说明。
- [x] 创建并验证带真实模型 trailer 的提交。

## 测试与验证

- 检查 `git remote -v`、`git config --local` 和 `git branch -vv`。
- 执行 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm test`、`pnpm build`、`pnpm docs:archive:check:ci`。
- 静态搜索品牌与 URL；人工验收前端、Swagger、推广站和 README 展示。

## 发布与回滚

本地 Git 配置可按原 URL 和配置项逐项恢复。品牌修改通过本次 Git 提交回滚；不涉及数据库、API 或会话迁移。

## 实际偏差和遗留问题

- 没有重命名 `cyber-ai-forge`、`@cyber-ai-forge/*`、JWT、浏览器存储或数据库技术标识，避免破坏依赖、会话和上游同步兼容性。
- 推广站原有的 15 张表、121 项测试统计已按当前实现校准为 17 张表、140 项测试。
- `pnpm format:check`、`pnpm lint`、`pnpm test`、`pnpm build` 和 `pnpm docs:archive:check:ci` 均通过；构建只产生既有 Sass、Rollup 注释、混合动态导入和大 chunk 警告。
- 按仓库边界未创建或运行前端自动化/浏览器测试；桌面、窄屏、Swagger 与发布站点仍需维护者人工验收。
- GitHub 服务端的 Cyber AI Forge 默认分支保护未由本任务修改，需维护者确认规则覆盖管理员。

## 相关设计、ADR 和 AI 日志

- [Cyber AI Forge 上游同步](../../design/upstream-synchronization.md)
- [Cyber-Sight 下游身份 ADR](../../decisions/ADR-20260811-cyber-sight-downstream-identity.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-11-cyber-sight-downstream-brand-and-sync.md)
