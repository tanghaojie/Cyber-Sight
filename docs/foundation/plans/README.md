# 活动计划

`type: documentation-archive-review` 的计划是跨 AI 智能体共享的归档审查任务。涉及业务行为、API、数据模型、模块边界、架构、迁移、ADR、计划或文档治理的 AI 任务，在首次修改文件前运行
`pnpm docs:archive:check`；只为报告中 `managed` 且 `DUE` 的作用域创建计划，`IN_PROGRESS` 时继续覆盖同一作用域的现有计划。跨作用域计划使用逗号分隔的 `review_scopes` 明确覆盖范围。下游不得为 `inherited` Foundation 创建本地计划。只读问答、代码浏览、格式化、注释和单文件机械改动可以跳过。该协议不使用任何 AI 平台私有目录。

开始任务时检查 `plans/active/`，只读取与当前目标相同或直接相关的计划。

## 进行中

- [分域文档归档审计重构](active/2026-08-18-scope-owned-documentation-archive-audit.md)：拆分共享归档协议与各所有权作用域状态，使下游只处理 Platform。

## 生命周期

- 非简单改动开始前，从[计划模板](../../templates/implementation-plan-template.md)创建 `active/YYYY-MM-DD-<topic>.md`。
- 实施中更新任务、偏差和验证结果。
- 完成、取消或被取代后写入最终状态，并移入 `docs/archive/plans/`。
- 历史计划只在需要复盘迁移、回归或旧方案时从[归档索引](../archive/README.md)查找。
