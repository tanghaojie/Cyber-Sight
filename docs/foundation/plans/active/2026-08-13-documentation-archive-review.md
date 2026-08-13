---
title: Forge 架构同步文档归档审查
type: documentation-archive-review
status: in_progress
scope: foundation
created: 2026-08-13
updated: 2026-08-13
---

# Forge 架构同步文档归档审查

## 触发原因

Foundation/Platform/Forge 架构同步造成文档作用域迁移，并将 Cyber-Sight 的产品文档从旧路径迁入 `docs/platform/`。归档审计因此重新检查当前 Design、ADR、计划、协作记录、归档基线和本地链接。

## 已完成审查

- 确认 Foundation 当前事实来自 Forge 同步后的代码、契约、迁移和设计文档。
- 将 Cyber-Sight 品牌、官网、产品设计、Platform ADR、历史计划和 AI 日志迁入 `docs/platform/`，不再保留旧路径。
- 恢复并迁移 Cyber-Sight 原有归档账本到 `docs/foundation/archive/archive-ledger.json`，保留人类维护的审查基线。
- 修复当前 Foundation/Platform 文档中的失效本地链接；未发现需要恢复的已取代 Foundation ADR。

## 待完成动作

- 在同步合并提交完成后，将本计划与本次同步计划、AI 日志一并归档。
- 以同步合并提交作为新的 `lastReviewedCommit` 更新归档账本，并重新运行 `pnpm docs:archive:check:ci`。

## 验证边界

归档审计只验证文档治理状态和本地链接；源码、契约、测试、Lint、构建和人工验收由主实施计划记录。
