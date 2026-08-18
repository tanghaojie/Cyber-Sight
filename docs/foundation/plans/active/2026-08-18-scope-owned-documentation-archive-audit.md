---
title: 分域文档归档审计重构
type: documentation-archive-review
review_scopes: foundation,forge,platform
scope: foundation
repository: Cyber-AI-Forge
owner: project maintainers
status: active
created: 2026-08-18
updated: 2026-08-18
---

# 分域文档归档审计重构

## 目标

将仓库级单一归档审计改为共享协议、仓库角色和所有权分域状态，使 Forge 上游可以分别审查 Foundation、Forge 与默认 Platform，下游业务仓库只创建和完成 Platform 归档任务。

## 背景与设计依据

现有脚本在 Foundation/Platform 所有权拆分前建立，拆分时只把策略、台账和计划路径迁入 `docs/foundation/`。下游 Platform 提交仍会触发审计，但规则要求修改只读的 Foundation 计划和台账，无法合法闭环。用户确认应重新设计并要求按评估方案实施。

## 范围

- 更新 Foundation 文档治理设计和长期 ADR。
- 引入仓库本地审计角色配置和 Foundation、Forge、Platform 独立台账。
- 按所有权作用域统计提交、ADR、完成计划、断链和失效 ADR。
- 让活动计划只覆盖显式声明的审查作用域，并让 CI 在审查完成前继续失败。
- 更新同步所有权、仓库规则、索引和脚本自动化测试。

## 非目标

- 不修改业务行为、HTTP API、数据库模型或前端页面。
- 不让下游直接修改或推进 Foundation 归档台账。
- 不引入依赖 AI 平台、远端仓库名称或本机路径的隐式角色判断。
- 不为每个业务模块维护独立审查基线。

## 前置条件和风险

- 迁移需要兼容旧版 repository ledger，并在完成后建立三个所有权作用域的新基线。
- 仓库角色配置属于 Platform 保留路径；下游首次接入时必须显式切换为 `platform-downstream`。
- 断链的责任按源文档归属；只读作用域的问题只能报告上游，不能在下游静默修正。

## 实施任务

- [x] 完成暂存区门禁、现行设计评估和归档审计。
- [x] 创建设计、ADR、实施计划和 AI 协作记录。
- [x] 实现仓库角色配置、分域台账和分域状态报告。
- [x] 更新同步配置、仓库规则与各作用域文档入口。
- [x] 增加 Forge 上游、Platform 下游、计划隔离和 CI 行为测试。
- [x] 完成格式、测试、构建、归档检查和最终差异复核。
- [ ] 建立新基线，归档完成计划与 AI 日志并创建带 AI trailer 的提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm test`
- `pnpm build`
- `pnpm docs:archive:check`
- `pnpm docs:archive:check:ci`
- Node 临时 Git 仓库测试覆盖上下游角色、分域计划和失败状态。

上述验证不涉及前端功能或浏览器行为，不替代维护者对其他前端任务的人工验收。

## 发布与回滚

先提交实现与验证结果，再把三个分域台账推进到该实现提交并归档任务文档。若新脚本失败，可回退实现提交并继续使用旧版 repository ledger；不得只删除 Platform 台账而保留部分 v2 配置。

## 实际偏差和遗留问题

本机 pnpm 在首次执行归档入口时触发可再生 `node_modules` 重建，依赖缓存随后出现不完整硬链接。最终删除并按锁文件重建整个依赖目录后，正式验证全部通过；没有修改锁文件或构建许可配置。

脚本自查时额外收紧了两项边界：纯 ledger 跨作用域提交不再误判为架构变更；下游只接受位于 managed scope 计划目录中的活动计划，因此只读 Foundation 计划即使声明 `review_scopes: platform` 也不能改变本地 Platform 状态。

生产构建保留现有 Sass legacy API、VueUse pure annotation 和 AdminLayout 动静态混合导入警告；本任务未修改对应前端实现。前端功能仍按仓库约定由维护者人工验收，本任务没有新增或运行前端浏览器测试。

## 相关设计、ADR 和 AI 日志

- `docs/foundation/design/documentation-governance.md`
- `docs/foundation/decisions/ADR-20260818-scope-owned-documentation-archive-audit.md`
- `docs/foundation/ai-logs/2026/08/2026-08-18-scope-owned-documentation-archive-audit.md`
