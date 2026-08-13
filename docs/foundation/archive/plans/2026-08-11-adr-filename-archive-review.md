---
title: ADR 日期命名归档审查
type: documentation-archive-review
status: completed
created: 2026-08-11
updated: 2026-08-11
scope: repository
baseline_commit: 63cf20a920f2d398dc22ce3340bc1118b1ee1f5e
---

# ADR 日期命名归档审查

## 目标

审查提交 `63cf20a` 引入的 ADR 日期命名规则，确认当前设计、ADR、索引、模板、归档审计和归档记录一致，并将归档台账推进到已核对基线。

## 背景与设计依据

提交后 `pnpm docs:archive:check:ci` 因完成计划累计达到三个返回 `DUE`。本轮审查范围是 ADR 日期命名文档治理变更；前置检查已确认无断链，DUE 原因仅为归档阈值。

依据：

- [分层文档与历史归档](../../design/documentation-governance.md)
- [ADR 日期命名规则](../../decisions/ADR-20260811-adr-filename-convention.md)
- [归档审计台账](../../archive/archive-ledger.json)

## 范围

- 核对 `63cf20a` 的当前文档和归档文档事实。
- 核对既有 ADR 文件名、旧引用和新 ADR 路径未发生非预期变化。
- 核对归档审计兼容旧格式和新格式，且没有新的断链、过期 ADR 或活动审查冲突。
- 更新归档台账，并归档本次审查计划和 AI 协作记录。

## 非目标

- 不重命名既有 ADR。
- 不修改业务代码、API 契约、数据模型、迁移或测试。
- 不重写历史 ADR、历史计划或历史 AI 日志正文。

## 前置条件和风险

- 当前提交只包含文档治理和审计脚本变更，代码事实没有变化。
- 归档台账必须使用本轮已核对的提交 `63cf20a920f2d398dc22ce3340bc1118b1ee1f5e`。
- 若发现当前文档与实现冲突，保留证据并停止归档；本轮预期不存在此类冲突。

## 实施任务

- [x] 核对触发原因、提交内容和当前文档入口。
- [x] 核对新旧 ADR 文件格式、索引、模板和引用边界。
- [x] 运行活动审查期间的归档检查并更新台账。
- [x] 完成计划和 AI 日志，归档并更新归档索引。
- [x] 运行最终归档 CI 检查。

## 测试与验证

- `pnpm docs:archive:check`
- `pnpm docs:archive:check:ci`
- `pnpm format:check`
- 检查当前 Markdown 相对链接和 ADR 状态/所在目录一致。

## 发布与回滚

本轮只更新归档台账、审查计划、AI 日志和归档索引。若审查失败，保留活动计划与证据，不推进台账；若需回滚，仅回滚本轮审查记录，不触碰 `63cf20a` 的规则实现。

## 实际偏差和遗留问题

触发原因是完成计划达到三个，未发现当前文档冲突、断链、过期 ADR 或活动归档审查冲突。没有修改既有 ADR、历史引用或业务代码。归档台账已推进到 `63cf20a920f2d398dc22ce3340bc1118b1ee1f5e`，审查标识为 `adr-filename-archive-review`。

验证结果：

- 活动审查期间 `pnpm docs:archive:check`：`IN_PROGRESS`，无原因。
- `pnpm format`：通过。
- 最终 `pnpm docs:archive:check:ci`：通过，状态为 `NOT_DUE`；归档台账基线与当前 `HEAD` 均为 `63cf20a920f2d398dc22ce3340bc1118b1ee1f5e`。

## 相关设计、ADR 和 AI 日志

- [分层文档与历史归档](../../design/documentation-governance.md)
- [ADR 日期命名规则](../../decisions/ADR-20260811-adr-filename-convention.md)
- [AI 协作记录](../../archive/ai-logs/2026/08/2026-08-11-adr-filename-archive-review.md)

关联提交：`63cf20a`。
