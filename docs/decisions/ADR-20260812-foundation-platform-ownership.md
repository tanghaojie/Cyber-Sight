---
title: 使用 Forge、Foundation 与 Platform 表达仓库所有权
status: accepted
date: 2026-08-12
---

# ADR-20260812：使用 Forge、Foundation 与 Platform 表达仓库所有权

## 背景

现有 `system`/`biz` 分类只覆盖前后端模块，API 契约、数据库、品牌、应用壳和文档仍处于混合所有权。业务平台为了品牌化和增加业务需要修改上游文件，根 README 与推广站也会参与完整 Git 合并，导致持续同步成本增长。

## 决策驱动因素

- 让开发人员只修改业务平台拥有的稳定目录。
- 允许 Forge 持续演进共享基础并安全同步到多个平台。
- 让前端、后端、契约、数据库和文档使用一致术语。
- 保留 Foundation 演进证据，支持下游排查根因。

## 决策

采用三个所有权作用域：

- `forge` 保存只属于 Cyber AI Forge 上游的宣传和维护内容。
- `foundation` 保存 Forge 维护、业务平台继承的共享基础设施。
- `platform` 保存具体业务平台拥有的业务、品牌、配置和历史。

原 `system` 统一重命名为 `foundation`，原 `biz` 统一重命名为 `platform`。Foundation 禁止依赖 Platform；Platform 只通过登记的公共入口依赖 Foundation。根 README 由当前仓库独立维护，Foundation 变更要求进入共享 changelog，不依赖 Forge README 传播。

本决策取代 ADR-0027 中只对前后端采用 `system`/`biz`、契约保持扁平的分类方案。

## 正面结果

- 目录直接表达同步所有权。
- 业务平台日常开发范围可以被静态检查。
- Foundation 历史和规范能够随上游同步。
- Forge 宣传内容不再污染业务平台。

## 负面结果与风险

- 初次迁移涉及大量路径和导入变化。
- 根组合文件仍需要受控集成，不能完全归入单一作用域。
- 现有开发人员和文档需要统一术语。

## 验证和复审条件

- 仓库中不再使用 `system` 或 `biz` 作为所有权目录。
- Foundation 到 Platform 的源码导入由自动检查拒绝。
- 至少一个业务平台完成连续两次同步演练且 Platform 无意外变更。
- 如果未来共享基础改为独立版本化包，重新评估全仓 Git 同步模型。

## 相关设计和计划

- [所有权边界设计](../design/foundation-platform-ownership.md)
- [实施计划](../plans/active/2026-08-12-foundation-platform-restructure.md)
