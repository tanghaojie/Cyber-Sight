---
title: 同步 Cyber AI Forge 2026-08-20 更新
scope: platform
repository: Cyber-Sight
owner: project maintainers
status: active
created: 2026-08-20
updated: 2026-08-20
---

# 同步 Cyber AI Forge 2026-08-20 更新

## 目标

将 Cyber AI Forge `70dbfbd2487c1be229c5a385fd328ca035470e25` 及其祖先更新以保留父提交的方式合并到 Cyber-Sight，并完成下游归档审计角色迁移。

## 背景与设计依据

本次同步遵循 [Cyber AI Forge 上游同步](../../design/upstream-synchronization.md)。上游新增按 Foundation、Forge、Platform 所有权分域的文档归档审计，解决旧机制要求业务下游修改 Foundation 计划和台账的问题。

## 范围

- 合并 `upstream/master` 到专用同步分支；
- 逐项处理共享组装点、配置、锁文件、规范和文档冲突；
- 保留 Cyber-Sight 品牌、Platform 业务实现和下游文档事实；
- 建立 `platform-downstream` 审计配置和 Cyber-Sight Platform 基线；
- 完成适用的格式、静态检查、测试、构建和归档审计。

## 非目标

- 不推送 Forge 上游；
- 不借同步重构 Geo 或新增业务功能；
- 不覆盖 Cyber-Sight 专属 Platform 历史。

## 前置条件和风险

- 同步前工作区和暂存区为空，`master` 跟踪 `origin/master`，默认推送目标为 `origin`，上游推送 URL 为 `DISABLED`；
- 上游包含目录所有权和环境配置调整，组装点与 Platform 保留文件需要人工审查；
- 前端行为和视觉仍由维护者人工验收。

## 实施任务

- [x] 完成远端、分支、工作区和暂存区安全检查；
- [x] 获取 `origin` 与 `upstream` 最新引用并创建同步分支；
- [ ] 合并 Forge 并解决冲突；
- [ ] 配置下游归档角色和 Platform ledger；
- [ ] 更新设计、计划、AI 日志与索引；
- [ ] 完成验证并创建带 AI trailer 的提交。

## 测试与验证

执行 `pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm test`、`pnpm build` 和 `pnpm docs:archive:check:ci`。同步涉及数据库或迁移时补充对应验证。

## 发布与回滚

验证通过后将同步分支合并回本地 `master`；在此之前不推送。失败时保留同步分支和证据，不改写已发布历史。

## 实际偏差和遗留问题

实施完成后补充。

## 相关设计、ADR 和 AI 日志

- [Cyber AI Forge 上游同步](../../design/upstream-synchronization.md)
- [AI 协作记录](../../ai-logs/2026/08/2026-08-20-forge-upstream-sync.md)
