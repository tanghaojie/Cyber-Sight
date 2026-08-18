---
title: 共享协议与所有权分域的文档归档审计
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
status: accepted
date: 2026-08-18
supersedes: ADR-0033
---

# ADR-20260818-scope-owned-documentation-archive-audit：共享协议与所有权分域的文档归档审计

## 背景

仓库原生归档审计建立时，项目文档仍使用单一 `docs/` 生命周期。Forge、Foundation 与 Platform 拆分后，策略、台账和活动计划被整体迁入 `docs/foundation/`，而审计仍读取仓库级 Git 历史。业务平台下游只能修改 Platform，却会被要求创建 Foundation 计划和推进 Foundation ledger，这与同步和只读边界冲突。

## 决策驱动因素

- Foundation 审计能力需要由 Forge 统一维护并同步给下游。
- 下游只能为自己拥有的 Platform 代码和文档建立归档任务。
- Forge、Foundation 与 Platform 的阈值、计划和完成状态不能互相掩盖。
- 归档状态必须存在于仓库内，供不同 AI 和 CI 共享，但不能依赖仓库名称或工具私有状态猜测角色。
- 断链等仓库完整性问题仍需覆盖只读内容，并明确上游修复路径。

## 考虑的方案

1. 继续使用单一 Foundation ledger，仅把下游计划移到 Platform：台账仍不可写，且全局状态互相掩盖。
2. 为三个作用域复制脚本和策略：所有权清楚，但会造成规则漂移和重复维护。
3. 共享脚本与策略，使用显式仓库角色和分域 ledger：能力单一来源，状态由各自所有者维护。

## 决策

采用方案 3。

- `scripts/docs/archive-audit.mjs` 和 Foundation policy 是共享协议。
- 根 `.archive-audit.json` 声明仓库角色、managed、inherited、excluded 作用域和 Integration 责任方；该配置按 Platform 路径在同步时保留。
- Foundation、Forge、Platform 分别在自己的 `archive/archive-ledger.json` 保存审查基线。
- 审计以文档所有权作用域为 review unit；component 和 module 仅作为报告证据。
- 活动计划只覆盖 frontmatter `scope` 或 `review_scopes` 显式列出的作用域。
- 下游 `platform-downstream` 只计算 Platform 周期阈值。只读 Foundation 的断链或失效 ADR返回 `UPSTREAM_REQUIRED`，不得创建本地 Foundation 计划。
- 日常检查可以返回 `IN_PROGRESS`；CI 只要 managed scope 仍然 `due: true` 就继续失败，直到 ledger 推进。
- Integration 路径归 Foundation 负责；下游直接产生 Integration 变更时报告上游责任，不吸收到 Platform 审查。

## 正面结果

- 下游归档任务与 Platform 写权限一致。
- 三个作用域拥有独立基线和任务状态，不再由任意单一计划全局放行。
- 审计算法和阈值继续由 Foundation 单一维护。
- 只读文档完整性问题仍可发现，并有明确的上游处理状态。

## 负面结果与风险

- 仓库首次切换角色时需要显式维护 `.archive-audit.json`。
- 三个 ledger 增加了迁移和索引维护成本。
- 跨作用域任务需要用 `review_scopes` 明确声明覆盖范围，否则会产生多个独立任务。
- 旧版单一 repository baseline 只能作为一次性迁移输入，不能继续表达分域完成状态。

## 验证和复审条件

- 临时 Git 仓库必须验证 Forge 上游和 Platform 下游的不同结果。
- Platform 提交不得要求下游修改 Foundation ledger 或计划。
- 同时到期的多个 managed scope 必须分别报告，且未匹配计划的作用域保持 `DUE`。
- CI 必须在 `IN_PROGRESS` 且 `due: true` 时失败。
- 若仓库角色频繁人工配置错误，复审是否应由脚手架初始化命令生成配置，但不得改为仓库名称猜测。

## 相关设计和计划

- `docs/foundation/design/documentation-governance.md`
- `docs/foundation/design/foundation-platform-ownership.md`
- `docs/foundation/plans/active/2026-08-18-scope-owned-documentation-archive-audit.md`
