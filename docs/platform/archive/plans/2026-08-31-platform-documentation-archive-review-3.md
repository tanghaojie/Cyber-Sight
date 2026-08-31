---
title: Geo 默认底图调整后的 Platform 文档归档审查
type: documentation-archive-review
scope: platform
review_scopes:
  - platform
repository: Cyber-Sight
owner: project maintainers
status: completed
created: 2026-08-31
updated: 2026-08-31
baseline_commit: e5e53d5783abfec2a94d50169e215c7f3877b185
trigger_commit: dc5918c5149885184627ecc3f54ac305de1d718a
---

# Geo 默认底图调整后的 Platform 文档归档审查

## 目标

处理归档审计报告的 Platform `DUE`，并确保 Geo 默认底图变更后的当前 Design、ADR、计划和协作记录彼此一致。

## 背景与设计依据

审计在当前 `HEAD` 报告 Platform 已达到四项完成特性阈值。Geo 当前设计和新的 Google · 混合默认底图 ADR 是本次审查的当前规范；被取代的旧影像默认源 ADR 应进入 Platform 决策归档。

## 范围

- 复核审计基线后的 Platform Geo 交付与当前文档一致性。
- 归档被新默认底图决策取代的影像默认源 ADR。
- 更新 Platform archive ledger，并完成最终 CI 审计。

## 非目标

- 不修改 Foundation 文档或 ledger。
- 不以归档审查替代 Geo 动态影像的人工验收。

## 前置条件和风险

Platform 是下游受管作用域；Foundation 为 inherited，不能在本仓库推进 Foundation ledger。动态 Cesium 图层行为仍需要维护者人工检查。

## 实施任务

- [x] 创建 Platform 归档审查计划并锁定触发基线。
- [x] 复核当前 Geo 设计、ADR、计划和 AI 记录。
- [x] 归档被取代的 ADR，并更新决策与归档索引。
- [x] 更新 ledger，执行最终归档 CI 审计并归档本计划和协作记录。

## 测试与验证

- `pnpm docs:archive:check`
- `pnpm docs:archive:check:ci`
- `git diff --check`

## 发布与回滚

审查只变更文档治理状态；如发现当前实现与文档冲突，应停止归档并以实现证据重新修正文档。

## 实际偏差和遗留问题

当前 Geo 设计、Google · 混合默认底图 ADR、实施计划和协作记录一致；旧影像默认源 ADR 已归档。更新 ledger 后，`pnpm docs:archive:check:ci` 返回 `NOT_DUE`；动态 Cesium 行为仍需维护者人工检查。

## 相关设计、ADR 和 AI 日志

- [Geo 前端空间可视化工作台](../../design/modules/geo.md)
- [Geo Google 混合默认底图 ADR](../../decisions/ADR-20260831-geo-google-hybrid-default.md)
- [默认底图实施计划](2026-08-31-geo-google-hybrid-default.md)
- [本次归档审查协作记录](../ai-logs/2026/08/2026-08-31-platform-documentation-archive-review-3.md)
