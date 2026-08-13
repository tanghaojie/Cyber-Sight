---
title: 前端品牌文字配置收敛
date: 2026-08-11
status: completed
---

# 前端品牌文字配置收敛

## 用户目标和约束

- 保留 `apps/backend/.env.example` 不变。
- 根目录 `.env.example` 已由用户手动删除，AI 不重新创建或覆盖。
- 删除前端 `VITE_APP_PRODUCT_LABEL`，所有原使用位置改用 `VITE_APP_TAGLINE`。
- Logo 下方产品描述转为大写；登录页左侧底部签名保持 `VITE_APP_TAGLINE` 原始大小写。
- 没有路由专属标题时，浏览器标题使用 `VITE_APP_FULL_NAME`。

## 关键问答与确认

- `VITE_APP_TAGLINE` 和产品标签不再作为两个独立配置项维护。
- 展示层仍保留大小写差异：Logo 描述大写，登录签名原文。
- 本次只涉及前端品牌文字配置，不修改后端、API、数据库或图形品牌资产。

## AI 的重要假设

- 前端 `appConfig` 是品牌环境变量的唯一运行时入口。
- `toUpperCase()` 只作用于 Logo 描述，不改变登录页签名或原始配置值。
- 前端行为按仓库约定由维护者人工验收，自动化验证使用类型检查、生产构建和格式检查。

## 方案和执行摘要

先完成暂存区门禁和文档归档审计，再更新当前品牌设计、前端模块设计、README、ADR、实施计划和本记录。随后删除 `productLabel` 配置，调整 Logo 与动态标题逻辑，并移除前端环境示例中的旧变量。

## 验证结果

- `pnpm format` 通过，且 `pnpm format:check` 通过。
- `pnpm lint` 通过。
- `pnpm --filter @cyber-ai-forge/frontend build` 通过，包含 `vue-tsc` 和 `vite build`；输出仅有既有 Sass/Rollup/chunk 警告。
- 旧 `VITE_APP_PRODUCT_LABEL` 和 `appConfig.productLabel` 已从运行时代码、环境示例和操作说明移除；ADR、计划和本日志保留历史名称作为迁移依据。
- 归档审计初次因临时归档路径断链返回 `DUE`，完成归档和索引更新后应复跑最终 CI 审计。

## 未决问题与下一步

剩余事项仅为维护者人工验收登录页签名、Logo 描述大小写和无专属路由标题时的浏览器标题。

## 相关设计、ADR、计划和提交

- [CYBER 品牌与视觉系统](../../../../design/branding.md)
- [前端应用与应用壳](../../../../design/modules/frontend.md)
- [ADR-20260811-frontend-brand-text-config](../../../../decisions/ADR-20260811-frontend-brand-text-config.md)
- [实施计划](../../../plans/2026-08-11-frontend-brand-text-config.md)
