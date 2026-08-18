---
title: ADR-0033 Task-scoped documentation archive audit
status: superseded
date: 2026-08-07
supersedes: ADR-0030
superseded_by: ADR-20260818-scope-owned-documentation-archive-audit
---

# ADR-0033：按任务范围触发文档归档审计

## 背景

仓库由多个 AI 智能体协作维护。原协议要求每个 AI 任务启动时运行归档审计，即使任务只是只读问答、代码浏览或简单格式修改，也会增加启动开销。归档审计真正关心的是实现事实、架构边界和文档治理是否发生了足够变化，而不是 AI 调用次数。

## 决策驱动因素

- 降低普通 AI 任务的无效启动开销。
- 保留跨 AI 可共享、与平台无关的归档状态。
- 让行为、API、架构和文档治理变更在首次写入前仍能发现待处理的归档审查。
- 在任务启动规则之外增加合并前的确定性兜底。

## 考虑的方案

1. 继续每次 AI 任务启动时运行审计：共享性最好，但普通任务成本过高。
2. 完全删除启动审计，只依赖人工归档：成本最低，但容易漏掉架构和文档冲突。
3. 按任务范围启动审计，并在 CI 或合并前强制审计：保留关键保护，同时减少普通任务成本。

## 决策

采用方案 3：

- 只读问答、代码浏览、格式化、注释和单文件机械改动可以跳过 `pnpm docs:archive:check`。
- 涉及业务行为、API、数据模型、模块边界、架构、迁移、ADR、计划或文档治理的任务，必须在首次修改文件前运行 `pnpm docs:archive:check`。
- 任务范围不明确或中途扩大时，在修改相关文件前补运行审计。
- 合并前或 CI 运行 `pnpm docs:archive:check:ci`，由 `--fail-on-due` 将 `DUE` 和 `BLOCKED` 转为失败；没有 CI 的任务在最终验证阶段运行该入口。
- `docs/archive/archive-policy.json`、`docs/archive/archive-ledger.json` 和 `type: documentation-archive-review` 活动计划继续作为跨 AI 的共享协议，不使用平台私有标记。
- 归档阈值、范围和立即触发条件不因本 ADR 改变。

## 正面结果

- 普通只读和简单机械任务不再强制启动归档审计。
- 关键代码、契约、架构和文档治理任务仍有修改前检查。
- CI/合并前检查提供跨任务的最终一致性门禁。

## 负面结果与风险

- AI 必须正确判断任务范围；判断错误可能推迟发现 `DUE` 状态。
- 没有 CI 的仓库任务依赖最终验证阶段执行兜底命令。
- 任务范围规则需要与 `AGENTS.md`、设计文档和计划索引保持同步。

## 验证和复审条件

- 用只读、格式化和单文件机械任务确认可跳过启动审计。
- 用业务/API/架构/文档治理任务确认首次修改前执行审计。
- 用 `pnpm docs:archive:check:ci` 确认 `DUE` 和 `BLOCKED` 会失败。
- 如果连续发生漏检，或 CI 无法稳定运行，应重新评估触发边界。

## 相关设计和计划

- [文档治理设计](../design/documentation-governance.md)
- [实施与归档审查计划](../archive/plans/2026-08-07-archive-check-trigger-policy.md)
