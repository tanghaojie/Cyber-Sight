---
title: 推广站优化后续文档归档审查
type: documentation-archive-review
status: completed
created: 2026-08-10
updated: 2026-08-10
---

# 推广站优化后续文档归档审查

## 目标

审查推广站截图优化和语言切换修复完成后的文档状态，并推进仓库归档基线。

## 背景与设计依据

提交 `e2f496e` 后 `pnpm docs:archive:check:ci` 因完成计划累计达到三个而返回 `DUE`。现行事实来源是推广站代码、`docs/design/marketing-site.md` 与 ADR-0037。

## 范围

- 核对截图优化、核心卡片网格和语言切换显现修复均已写入现行设计。
- 核对对应计划和 AI 日志已归档并被索引。
- 推进归档审查台账并重新运行 CI 检查。

## 非目标

- 不修改页面功能、架构或 ADR。
- 不审查无关模块和历史主题。

## 前置条件和风险

- 以提交 `e2f496e` 的代码与已通过验证为审查基线。

## 实施任务

- [x] 核对现行设计与实现一致性。
- [x] 核对完成计划、AI 日志和归档索引。
- [x] 更新台账并通过归档 CI 检查。

## 测试与验证

运行 `pnpm docs:archive:check:ci`，结果必须为 `NOT_DUE`。

## 发布与回滚

本计划只更新文档治理状态，随独立文档提交发布。

## 实际偏差和遗留问题

现行设计已记录真实截图、无断层核心卡片网格和语言切换时的稳定组件身份；对应计划与 AI 日志均已归档并被索引。未发现需要归档或取代的现行 Design、ADR，台账基线推进到 `e2f496e`。

## 相关设计、ADR 和 AI 日志

- [推广站设计](../../design/marketing-site.md)
- [ADR-0037](../../decisions/ADR-0037-static-marketing-site.md)
