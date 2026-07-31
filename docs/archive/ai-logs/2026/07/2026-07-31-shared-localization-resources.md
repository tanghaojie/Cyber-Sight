---
title: 共享多语言资源提取
date: 2026-07-31
status: completed
---

# 共享多语言资源提取

## 用户目标和约束

提取新增、查看、删除等多模块复用的语言配置，统一放到 shared 中供各模块调用。

## 关键问答与确认

无；按现有前端运行时多语言架构实施。

## AI 的重要假设

- 当前 `localization.locales.ts` 中的操作、状态、表格、确认和通用反馈文案是领域无关平台文案。
- 各模块已有的实体专属文案（例如“新增用户”）继续由各自模块拥有。

## 方案和执行摘要

在 `src/shared/localization/` 提供资源定义和 `shared` 命名空间资源。资源加载器新增 shared 路径，现有 32 处通用操作、状态和反馈调用迁移到 `shared.*`；原资源定义辅助函数随之迁入 shared，避免 shared 反向依赖系统模块。

## 验证结果

- `pnpm format`、`pnpm format:check` 和 `pnpm lint` 通过。
- `pnpm --filter @scaffold/frontend build` 通过，包含 `vue-tsc` 与 Vite 生产构建。
- Vite 仅输出既有 Sass legacy API 及静态、动态重复导入警告。

## 未决问题与下一步

无。维护者可在中英文间切换后人工确认共享操作、状态和提示在各管理页面保持正确显示。

## 相关设计、ADR、计划和提交

- [实施计划](../../../plans/2026-07-31-shared-localization-resources.md)
- [运行时多语言设计](../../../../design/modules/localization.md)
- [ADR-0029](../../../../decisions/ADR-0029-frontend-runtime-localization.md)
