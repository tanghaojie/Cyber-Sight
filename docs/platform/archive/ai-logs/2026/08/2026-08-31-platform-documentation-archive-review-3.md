---
title: Geo 默认底图调整后的 Platform 文档归档审查
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-31
status: completed
---

# Geo 默认底图调整后的 Platform 文档归档审查

## 用户目标和约束

用户要求收敛 Geo 启动影像；仓库归档审计同时报告 Platform `DUE`，必须完成对应文档归档闭环。

## 关键问答与确认

当前 Platform 为受管下游作用域，Foundation 仅继承，不修改 Foundation 文档或 ledger。

## AI 的重要假设

新的 Google · 混合默认底图 ADR 取代旧的 Natural Earth II/天地图默认策略；旧 ADR 归档不会改变仍被保留的影像目录能力。

## 方案和执行摘要

先以当前代码和用户指令更新 Geo 设计与 ADR，再归档被取代的决策，更新 Platform ledger，并以 CI 审计确认 `NOT_DUE`。

## 验证结果

当前 Geo 设计、Google · 混合默认底图 ADR、实施计划和协作记录一致；旧影像默认源 ADR 已归档。更新 ledger 后，`pnpm docs:archive:check:ci` 返回 `NOT_DUE`。

## 未决问题与下一步

归档审查完成后，Cesium 动态影像行为仍留给维护者人工验收。

## 相关设计、ADR、计划和提交

- [Geo 当前设计](../../../../design/modules/geo.md)
- [归档审查计划](../../../../plans/2026-08-31-platform-documentation-archive-review-3.md)
