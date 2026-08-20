---
title: 同步 Cyber AI Forge 2026-08-20 更新
scope: platform
repository: Cyber-Sight
owner: project maintainers
date: 2026-08-20
status: completed
---

# 同步 Cyber AI Forge 2026-08-20 更新

## 用户目标和约束

用户要求同步 Forge 并合并代码。同步必须保留 Cyber-Sight 的产品品牌、Platform 业务实现和独立历史，并采用保留上游父提交的合并方式。

## 关键问答与确认

- 用户此前确认旧归档门禁的 Foundation 所有权冲突可暂时忽略，并要求在 Forge 重新设计后评估；
- 本轮评估确认上游 `8b22250` 引入的分域审计适合 Cyber-Sight，用户随后明确授权同步合并。

## AI 的重要假设

- 本轮只同步当前 `upstream/master`，不顺带修改业务功能；
- Cyber-Sight 使用 `platform-downstream` 角色，只推进 Platform ledger。

## 方案和执行摘要

- 确认暂存区和工作区为空，remote、tracking 与禁用上游 push 配置正确；
- 获取两个远端，确认本地 `master` 相对 `origin/master` 仅领先且无需拉取；
- 从 `master` 创建 `sync/forge-2026-08-20` 分支；
- 后续逐项审查合并冲突、建立下游审计配置并运行完整验证。

## 验证结果

- `pnpm format`：通过；
- `pnpm format:check`：通过；
- `pnpm lint`：通过；
- `pnpm test`：143 个后端测试和 8 个脚本测试通过；首次沙箱执行因 esbuild 路径读取权限失败，正常环境重跑通过；
- `pnpm build`：通过，保留既有 Sass legacy API、VueUse annotation、AdminLayout 动静态导入和 Cesium 大 chunk 警告；
- `pnpm docs:archive:test`：4 个归档审计测试通过；
- `pnpm docs:archive:check:ci`：完成 ledger 后执行。

## 未决问题与下一步

- 前端运行行为和视觉需要维护者人工验收；本次没有应用源码变化。

## 相关设计、ADR、计划和提交

- [Cyber AI Forge 上游同步](../../../../design/upstream-synchronization.md)
- [实施计划](../../../plans/2026-08-20-forge-upstream-sync.md)
