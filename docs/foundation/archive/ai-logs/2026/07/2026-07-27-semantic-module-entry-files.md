---
title: 前端模块表意公共文件迁移
date: 2026-07-27
status: completed
---

# 前端模块表意公共文件迁移

## 用户目标和约束

- 尽量删除 `apps/frontend/src/modules` 各模块中的 `index.ts`。
- 遵循仓库代码规范，以能表达职责的文件名替代无语义入口。
- 遵守暂存区门禁、非简单改动文档门禁、验证和自动提交要求。

## 关键问答与确认

- 用户直接指定前端模块目录，无需扩展为本轮迁移后端和契约包。
- 现有 ADR-0009 的默认 `index.ts` 决策与新规范冲突，因此新增 ADR-0013 取代入口命名部分。

## AI 的重要假设

- “尽量删除”解释为删除前端模块目录下所有没有框架硬约束的 `index.ts`。
- 公共边界不能随 barrel 删除而消失；改由模块设计登记表意公共文件。
- 本次保持所有业务行为和导出符号语义不变。

## 方案和执行摘要

- 页面注册模块直接在 `view-registry.ts` 定义懒加载器。
- 应用组合根直接依赖 `auth.store.ts`、`navigation.store.ts`，并通过新的表意路由文件加载登录与错误页。
- 跨模块角色选项直接使用 `roles.api.ts`；菜单树选项拆到 `menu-options.ts`。
- 同步设计、ADR、维护指南、计划与索引。

## 验证结果

- `apps/frontend/src/modules` 下已经不存在 `index.ts`，旧模块入口导入搜索无结果。
- `pnpm --filter @scaffold/frontend test` 通过：10 个测试文件、28 个测试。
- `pnpm --filter @scaffold/frontend build` 通过，包含 `vue-tsc` 和 Vite 生产构建。
- `git diff --check` 通过；所有新增文档和公共文件路径存在。
- 构建输出仅包含第三方依赖已有的弃用与注释警告，不影响本次交付。

## 未决问题与下一步

- 后端和 API 契约包存量 `index.ts` 在所属模块后续实质修改时迁移。
- 当前无阻塞项。

## 相关设计、ADR、计划和提交

- `docs/archive/design/module-boundaries.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0013-semantic-module-entry-files.md`
- `docs/archive/plans/2026-07-27-semantic-module-entry-files.md`
- Git 提交：`refactor(frontend): replace module index files with semantic entries`
