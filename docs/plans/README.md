# 活动计划

`type: documentation-archive-review` 的计划是跨 AI 智能体共享的归档审查任务。任何 AI 启动任务时先运行
`pnpm docs:archive:check`；发现 `DUE` 且没有同一范围的活动计划时，创建一个标准计划，发现 `IN_PROGRESS`
时继续已有计划。该协议不使用任何 AI 平台私有目录。

开始任务时检查 `plans/active/`，只读取与当前目标相同或直接相关的计划。

## 进行中

- [仓库原生文档归档审查后续](active/2026-08-06-repository-native-archive-review-follow-up.md)

## 生命周期

- 非简单改动开始前，从[计划模板](../templates/implementation-plan-template.md)创建 `active/YYYY-MM-DD-<topic>.md`。
- 实施中更新任务、偏差和验证结果。
- 完成、取消或被取代后写入最终状态，并移入 `docs/archive/plans/`。
- 历史计划只在需要复盘迁移、回归或旧方案时从[归档索引](../archive/README.md)查找。
