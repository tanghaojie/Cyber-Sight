# 历史文档归档

本目录保存初始版本形成过程、已完成任务和被合并设计的证据，不定义当前行为，也不属于 AI 默认阅读集。当前事实从[文档入口](../README.md)和[设计索引](../design/README.md)读取；发现冲突时以人类维护者的当前内容为准。

## 2026-07-29 初始版本切点

维护者提交 `f10f584` 及其父提交构成初始版本逻辑基线。ADR-0001 至 ADR-0023 已从当前区移入 `decisions/`，保留从脚手架探索到基线形成的取舍，但不再作为日常任务规范。当前协作原则见 [ADR-0024](../decisions/ADR-0024-human-authored-state-authority.md)。

## 设计快照

| 历史主题 | 归档文件 | 当前来源 |
| --- | --- | --- |
| 管理系统能力汇总 | [management-system.md](design/management-system.md) | [系统概览](../design/system-overview.md)与[模块设计](../design/README.md) |
| 动态导航与品牌 | [dynamic-navigation-and-branding.md](design/dynamic-navigation-and-branding.md) | [前端应用与应用壳](../design/modules/frontend.md)、[菜单](../design/modules/menus.md)与[导航](../design/modules/navigation.md) |
| 系统和模块边界压缩前快照 | [system-overview.md](design/system-overview.md)、[module-boundaries.md](design/module-boundaries.md) | [系统概览](../design/system-overview.md)与[模块边界](../design/module-boundaries.md) |
| 前端应用壳阶段快照 | [早期快照](design/frontend-shell.md)、[初始版本前快照](design/frontend-shell-pre-initial-baseline.md) | [前端应用与应用壳](../design/modules/frontend.md) |

## ADR 主题路由

归档 ADR 均位于 `decisions/`。只在排查回归、理解取舍或准备恢复旧方案时按主题选择一至两份：

| 主题 | ADR 范围 | 当前来源 |
| --- | --- | --- |
| API 响应、HTTP 状态、运行时契约与 Zod | ADR-0001 至 ADR-0007 | [API 契约](../design/modules/api-contract.md)、[后端](../design/modules/backend.md)与[错误码](../reference/error-codes.md) |
| 前端技术栈、动态导航、模块入口、布局与图标 | ADR-0008 至 ADR-0013、ADR-0017、ADR-0018 | [前端应用与应用壳](../design/modules/frontend.md)与[模块边界](../design/module-boundaries.md) |
| 软删除、审计和有效记录唯一性 | ADR-0014、ADR-0015 | [后端](../design/modules/backend.md)及用户、角色、菜单、字典模块设计 |
| 分层文档和工程工作流 | ADR-0016、ADR-0021 至 ADR-0023 | [文档治理](../design/documentation-governance.md)、[开发工作流](../design/developer-workflow.md)与[验证策略](../design/testing-strategy.md) |
| JWT 会话和 LRU 读缓存 | ADR-0019、ADR-0020 | [认证模块](../design/modules/auth.md) |

## 完成计划与 AI 协作记录

- `plans/`：按 `YYYY-MM-DD-<topic>.md` 保存完成、取消或被取代的实施计划。
- `ai-logs/YYYY/MM/`：保存对应任务的结构化协作记录。
- 2026-07-31：[CYBER 框架重品牌实施计划](plans/2026-07-31-cyber-branding.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-31-cyber-branding.md)。
- 2026-07-30：[可插拔授权与部门实施计划](plans/2026-07-30-pluggable-authorization.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-30-pluggable-authorization.md)。
- 2026-07-30：[中文代码注释实施计划](plans/2026-07-30-chinese-code-comments.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-30-chinese-code-comments.md)。
- 2026-07-30：[部门树形展示实施计划](plans/2026-07-30-department-tree-view.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-30-department-tree-view.md)。
- 2026-07-30：[系统表前缀与迁移基线重构实施计划](plans/2026-07-30-system-table-prefix-and-migration-baseline.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-30-system-table-prefix-and-migration-baseline.md)。
- 2026-07-30：[默认菜单迁移基线修正计划](plans/2026-07-30-default-menu-baseline.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-30-default-menu-baseline.md)。
- 2026-07-30：[前后端系统与业务模块分层及 Header 紧凑化计划](plans/2026-07-30-system-biz-module-layout.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-30-system-biz-module-layout.md)。
- 2026-07-30：[管理端 tag view 实施计划](plans/2026-07-30-frontend-tag-view.md)及其 [AI 协作记录](ai-logs/2026/07/2026-07-30-frontend-tag-view.md)。
- 2026-06 的文件描述脚手架起点；2026-07-22 至 2026-07-23 主要记录管理基础、契约和测试；2026-07-27 至 2026-07-29 主要记录模块边界、动态导航、认证和工程治理；2026-07-30 起继续记录基线后的功能修正与模型精简。

计划和日志只用于复盘实施过程，不用于定义当前行为。需要定位时先按日期或主题文件名搜索，最多打开与问题最相关的一至两份。
