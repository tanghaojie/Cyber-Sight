---
title: 分层文档与历史归档
status: accepted
owner: project maintainers
updated: 2026-07-28
---

# 分层文档与历史归档

## 目标

让人和 AI 先获得完成当前任务所需的最小、现行上下文，同时保留可按需追溯的决策、计划和协作证据。文档分为“当前事实”和“历史证据”，禁止把归档内容当作默认阅读集。

## 目录与职责

```text
docs/
├── README.md              # 最小阅读入口与任务路由
├── design/                # 当前有效的系统和模块设计
├── decisions/             # 当前有效的 ADR
├── plans/active/          # 正在执行的计划
├── ai-logs/               # 正在执行任务的结构化协作记录
├── guides/                # 人类操作指南，按需阅读
├── reference/             # 当前参考表，按需查询
├── templates/             # 新文档模板
└── archive/               # 历史证据；默认不读取
    ├── design/
    ├── decisions/
    ├── plans/
    └── ai-logs/
```

`design/` 回答“现在怎样工作”，`decisions/` 回答“现行长期约束为何成立”。计划和 AI 日志只在任务进行期间留在当前区；完成、取消或被取代后进入 `archive/`。归档不再作为现行规范维护，但必须保留原始状态、替代关系和可追溯路径。

## 最小阅读协议

每次任务先读 `docs/README.md` 并检查 `docs/plans/active/`。随后只按任务关键词从 `design/README.md` 和 `decisions/README.md` 选择直接相关文档；禁止递归读取整个 `docs/`。

默认不读 `docs/archive/**`、完成的 AI 日志、模板和面向人类的指南。只有以下情况才进入归档：

- 用户明确要求历史、原因、迁移或旧行为；
- 当前设计或 ADR 明确要求查阅某份历史证据；
- 排查回归、兼容性或决策冲突，且当前文档不足以解释；
- 准备恢复被废弃的方案。

进入归档时先读 `docs/archive/README.md`，再打开其中一至两份最相关文件，不做无目标的全量扫描。

## 生命周期

- Design：原地维护当前事实；被合并、废弃或大幅重写的旧版本移入 `archive/design/`。
- ADR：已接受且仍有效的记录留在 `decisions/`；被取代后移入 `archive/decisions/`，编号永不复用。
- Plan：任务期间位于 `plans/active/`；结束后标记最终状态并移入 `archive/plans/`。
- AI Log：任务期间位于 `ai-logs/YYYY/MM/`；随任务结束移入 `archive/ai-logs/YYYY/MM/`。
- Guide、Reference、Template：只保留当前可用版本；纯历史版本按内容类型进入归档。

归档迁移必须同步更新当前索引和相对链接。当前文档优先链接现行设计或 ADR；历史计划和日志集中从归档索引查找，避免在每份当前模块设计中重复罗列。

## 压缩规则

- 一个事实只保留一个当前权威来源，其他文档用链接和一句话摘要引用。
- 当前设计保留边界、接口、数据流、失败模式和测试策略；实施过程、逐次偏差和已完成清单进入归档。
- ADR 保留决策背景、选择、影响和复审条件，不复制完整实现说明。
- 索引只路由现行文档，不展开历史文件清单。
- 可由代码、测试或 Git 直接恢复的逐文件过程不复制到当前文档。

## 验证

文档结构调整后至少验证：当前索引无归档项混入、Markdown 相对链接存在、ADR 状态与所在目录一致、`plans/active/` 只含进行中计划，以及默认阅读集的文件数和行数没有反向增长。

## 相关决策

- [ADR-0016：当前文档与历史归档分层](../decisions/ADR-0016-tiered-documentation-and-archive.md)
