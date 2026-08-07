---
title: Cyber AI Forge 改名后的文档归档审查
type: documentation-archive-review
status: active
created: 2026-08-07
updated: 2026-08-07
---

# Cyber AI Forge 改名后的文档归档审查

## 目标

根据 `pnpm docs:archive:check` 在提交 `8ecaa1b` 后报告的 `architecture change detected`，复核当前代码、设计、ADR、测试、契约、迁移和 Git 历史，确认现行文档已覆盖最新事实，再归档已被取代的历史内容。

## 触发证据

- 触发命令：`pnpm docs:archive:check`
- 结果：`DUE`
- 归档基线：`334c2137c1990c1216cb8404b7febc9bef9ff749`
- 当前提交：`8ecaa1ba8453d2a9a119bcc636829a32f0fcb49d`
- 原因：`architecture change detected`

## 范围与非目标

- 范围：Cyber AI Forge 改名提交影响到的当前 Design、ADR、计划/日志归档、代码、测试、契约和迁移事实。
- 非目标：不回退品牌改名，不修改业务行为、数据库结构、API 路由或用户数据。

## 实施任务

- [ ] 对照当前代码、测试、契约、迁移和 Git 历史复核品牌与项目级技术标识。
- [ ] 补齐仍有效的 Design/ADR，识别已被取代的历史文档。
- [ ] 按归档策略移动取代内容并更新索引、台账和关联链接。
- [ ] 运行归档审计与相关格式/静态验证，记录结果和遗留问题。

## 当前状态

已按仓库协议创建活动计划；后续 AI 任务应优先继续本计划，避免重复创建归档审查计划。

## 相关提交

- `8ecaa1b`：`chore: rename project to Cyber AI Forge`
