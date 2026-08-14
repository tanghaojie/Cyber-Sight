---
title: Foundation 与 Platform 分层运行时配置
scope: foundation
repository: Cyber-AI-Forge
owner: maintainers
date: 2026-08-13
status: completed
---

# Foundation 与 Platform 分层运行时配置

## 用户目标和约束

用户确认实施“Foundation 配置层 + Platform 配置层 + Integration 聚合入口”，要求 Forge 基础脚手架与业务 Platform 配置分层维护，并避免代码合并冲突。Foundation 表示共享基础设施，Platform 表示业务平台。

## 关键问答与确认

- 前端当前品牌配置位于 Platform，后端当前统一 `env.ts` 位于 Foundation，逻辑和所有权不一致。
- 采用两层配置文件和统一聚合入口，不建立大型共享配置 package。
- 不修改真实本地 `.env` 和敏感凭据。

## AI 的重要假设

- `*.local` 文件继续由仓库级忽略规则排除。
- 部署环境变量优先级高于示例和本地文件，Platform 值可以覆盖同名 Foundation 默认值，但不能改变 Foundation 的校验责任。
- Vite 仅向浏览器暴露 `VITE_*` 配置。

## 方案和执行摘要

后端新增 `foundation.config.ts`、`platform.config.ts` 和 Integration `runtime.config.ts`；前端新增对应 Foundation/Platform 配置与 runtime 聚合；Vite 使用内置 `loadEnv` 读取分层 local 文件；示例文件、同步清单、设计、ADR、README 和维护指南已同步更新。

## 验证结果

`pnpm format`、`pnpm format:check`、`pnpm lint`、`pnpm test`、`pnpm build` 和 `pnpm architecture:check` 均通过；实现提交前的归档 CI 因旧基线识别为 `DUE`，更新账本到实现提交后重新执行并通过。前端未创建自动化浏览器测试，仍需维护者人工确认品牌变量和端口覆盖效果。

## 未决问题与下一步

未发现阻塞问题。旧单一 `.env.example` 已删除，开发者需复制两份分层示例为对应 `.local` 文件。

## 相关设计、ADR、计划和提交

- [实施计划](../../../plans/2026-08-13-layered-runtime-configuration.md)
- 实现提交：`8364215933197d5966e70ed8cd27f256c0cede55`
