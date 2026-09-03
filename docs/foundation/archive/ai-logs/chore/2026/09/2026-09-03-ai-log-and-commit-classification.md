---
title: AI 日志与 Git 提交分类实施
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
date: 2026-09-03
status: completed
change_type: chore
---

# AI 日志与 Git 提交分类实施

## 用户目标和约束

将 AI 日志按 `chore`、`docs`、`feat`、`fix`、`refactor`、`style`、`test`、`ci`、`build`、`revert`
分类存放，并让 Git 提交严格遵守同一分类；Forge 有下游接入，历史记录暂不迁移。

## 关键问答与确认

维护者先要求评估下游影响，随后明确要求开始实施。

## AI 的重要假设

仅对 2026-09-03 起的新日志和新提交启用规则；归档中的历史路径和 Git 历史保持不变。

## 方案和执行摘要

建立 Foundation ADR、治理规则和模板；以 shared Node 校验脚本驱动本地 `commit-msg` hook、范围检查和
GitHub 工作流。Foundation 与 Integration 文件随同步进入下游，Platform 文档与本地 hooks 由下游维护者接入。

## 验证结果

允许与拒绝的标题、含正文标题、新脚本与工作流的同步归类测试全部通过；提交标题范围校验、归档 CI、
ESLint 和 Prettier 检查通过。项目 `pnpm` 包装命令在执行格式、测试和构建脚本前被
`@scarf/scarf` 忽略构建许可策略阻断，因此没有项目级 test/build 结果；该副作用产生的工作区
许可行已移除，未纳入版本控制。

## 未决问题与下一步

下游分支保护无法由 Forge 自动配置，需要维护者接入时确认；下游保留的 Platform AI 日志 README
也需在其仓库同步更新。

## 相关设计、ADR、计划和提交

- `docs/foundation/design/documentation-governance.md`
- `docs/foundation/decisions/ADR-20260903-ai-log-and-commit-classification.md`
- `docs/foundation/plans/active/2026-09-03-ai-log-and-commit-classification.md`
