---
title: 分域文档归档审计重构
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
date: 2026-08-18
status: completed
downstreamAction: configure-platform-profile
---

# 分域文档归档审计重构

## 用户目标和约束

用户指出归档任务按全项目设计，而下游任务只负责 Platform，要求评估问题并按重新设计方案实施。实现必须保持 Foundation 下游只读、Platform 历史由业务平台维护，并遵守仓库文档门禁、格式和提交规则。

## 关键问答与确认

- 只读评估确认现有脚本将策略、repository ledger、ADR 和活动计划全部固定在 `docs/foundation/`。
- Git 历史确认归档审计早于三层所有权模型，后续迁移只调整了路径，没有重构责任模型。
- 用户在收到分域方案后明确要求按计划实施。

## AI 的重要假设

- 审计规则和执行脚本属于 Foundation，可同步给下游。
- 审计基线和活动任务属于实际可写的文档所有权作用域。
- Integration 变更由 Foundation 负责；下游发现此类问题时只报告上游。
- 第一版以所有权作用域作为审查单元，模块只作为证据，不维护模块级 ledger。

## 方案和执行摘要

引入显式仓库角色配置，分别维护 Foundation、Forge、Platform ledger。审计按 `.forge-sync.yml` 分类提交路径，按文档源文件归属断链责任，并为每个作用域独立匹配活动计划。Platform 下游只管理 Platform，Foundation 问题使用 `UPSTREAM_REQUIRED` 报告。

实现增加 `.archive-audit.json`、三个 v2 ledger、分域 JSON/人类可读报告和临时 Git 仓库测试。CI 根据 `due` 而非顶层 `IN_PROGRESS` 决定失败。同步测试确认下游角色配置像其他 Platform 文件一样保留；下游只接受 managed 目录中的计划。

## 验证结果

- `git diff --cached --quiet`：通过，任务开始时暂存区为空。
- `node scripts/docs/archive-audit.mjs --json`：旧版审计返回 `NOT_DUE`。
- `pnpm format`、`pnpm format:check`、`pnpm lint`：通过。
- `pnpm test`：工具层 8 项测试、后端 143 项测试及 API 契约构建验证通过。
- `pnpm build`：API 契约、后端、前端和 Forge website 生产构建通过；保留既有 Sass、VueUse annotation 和 AdminLayout chunk 警告。
- `node scripts/architecture/check-ownership.mjs`：通过。
- `pnpm docs:archive:check`：v2 Forge 上游三个 managed scope 均无断链或失效 ADR。
- 实现提交 `8b22250c3c8b7e6f1f9852f5c79af65bcca724b5` 后，Foundation 与 Platform 返回 `IN_PROGRESS` 且 `due: true`，Forge 返回 `NOT_DUE`；证明分域状态和 CI 语义生效。
- 本机依赖目录在首次 pnpm 自检后需要重建；最终按锁文件完整恢复，未产生版本控制改动。

## 未决问题与下一步

没有遗留实现问题。业务平台下游接入本版本时需要从公共模板建立自己的 `platform-downstream` 配置和 Platform 基线，不得复制 Forge 的 Foundation ledger。

## 相关设计、ADR、计划和提交

- `docs/foundation/design/documentation-governance.md`
- `docs/foundation/decisions/ADR-20260818-scope-owned-documentation-archive-audit.md`
- `docs/foundation/plans/active/2026-08-18-scope-owned-documentation-archive-audit.md`
- 实现提交：`8b22250c3c8b7e6f1f9852f5c79af65bcca724b5`
