---
title: 授权安全修复前的文档归档审查
type: documentation-archive-review
status: active
created: 2026-08-10
updated: 2026-08-10
---

# 授权安全修复前的文档归档审查

## 目标

处理 `pnpm docs:archive:check` 返回的 `DUE`，复核上次基线之后的 package scope 架构变更和本次授权安全修复，保证当前设计、ADR、计划、日志和归档索引一致。

## 背景与设计依据

归档台账基线为 `e2f496e285be32c2a78807157315004f269dbd2c`。审计识别到 workspace package scope 架构变更；当前 `HEAD` 为 `abd116ca4193ebe3feeafdfcfb5d4952d2f385e2`，现行设计和 ADR-0031 已随该提交同步。

## 范围

- 复核基线之后的有效提交、现行设计、ADR 和已归档实施记录。
- 完成本次安全修复后再次核对授权与用户设计、ADR 和测试。
- 更新归档台账、归档本计划并更新归档索引。

## 非目标

- 不恢复旧 package scope 或历史授权方案。
- 不无目标读取或重写其他归档文件。

## 前置条件和风险

- 最终台账必须指向包含安全修复的已提交基线，因此本计划在安全修复提交后完成。
- 发现人类实现与文档意图冲突时停止归档，不猜测处理。

## 实施任务

- [x] 运行任务范围归档审计并记录 `DUE` 证据。
- [x] 复核基线后 package scope 提交及现行文档同步情况。
- [x] 复核授权安全修复的最终代码、测试、设计和 ADR。
- [ ] 更新台账、归档计划并通过 `pnpm docs:archive:check:ci`。

## 测试与验证

- `pnpm docs:archive:check:ci`
- `pnpm format:check`
- 当前文档索引和相对链接检查由仓库现有验证入口覆盖。

## 发布与回滚

台账更新只在对应代码与文档提交存在后生效；若安全修复未提交，本计划保持 active，不提前推进基线。

## 实际偏差和遗留问题

基线后的 workspace package scope 迁移已经由现行品牌、工程与 ADR 文档覆盖，没有发现需恢复或归档的冲突设计。授权安全修复的代码、139 项后端测试、模块设计和 ADR-0038 已一致；待安全提交生成后更新台账并完成本计划。

## 相关设计、ADR 和 AI 日志

- [分层文档与历史归档](../../design/documentation-governance.md)
- [授权安全修复计划](../../archive/plans/2026-08-10-authorization-delegation-boundary.md)
