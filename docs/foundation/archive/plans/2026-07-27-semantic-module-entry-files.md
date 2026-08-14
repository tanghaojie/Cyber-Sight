---
title: 前端模块表意公共文件迁移
status: completed
created: 2026-07-27
updated: 2026-07-27
---

# 前端模块表意公共文件迁移

## 目标

删除 `apps/frontend/src/modules` 下能够替代的全部 `index.ts`，让导入路径直接表达路由、状态、API、页面注册或业务用例职责，同时保留可审查的模块公共边界。

## 背景与设计依据

现有 ADR-0009 强制模块通过 `index.ts` 公开能力，但仓库代码规范要求尽量避免这类无语义文件名。最终边界规则见 `docs/archive/design/module-boundaries.md`，入口命名调整由 ADR-0013 记录。

## 范围

- 迁移前端八个模块的 `index.ts`。
- 新增必要的表意路由或用例文件，并更新应用组合根、模块间调用和测试 mock。
- 同步模块边界、前端、导航、维护指南和相关长期规范。

## 非目标

- 本次不迁移后端或 API 契约包的存量 `index.ts`。
- 不改变登录、导航、动态页面注册、管理 API 或页面行为。
- 不引入新的依赖边界检查工具。

## 前置条件和风险

- 删除 barrel 后不能放开任意深层导入；只有设计登记的表意文件可作为跨模块依赖。
- `view-registry.ts` 仍是路由组合根专用的构建期发现入口。
- 文件迁移可能影响 Vitest mock 路径和 Vite 动态导入，必须同时运行测试与生产构建。

## 实施任务

- [x] 检查暂存区、现有设计、ADR、活动计划和全部前端模块入口引用。
- [x] 更新设计、ADR、实施计划和 AI 协作记录。
- [x] 删除模块级 `index.ts` 并迁移引用。
- [x] 搜索残留路径，运行前端测试与构建。
- [x] 补充实际结果，归档计划并提交。

## 测试与验证

- `rg --files apps/frontend/src/modules -g index.ts` 无输出。
- `pnpm --filter @scaffold/frontend test`。
- `pnpm --filter @scaffold/frontend build`。
- 审查 Git diff，确认没有业务行为变化和无关改动。

## 发布与回滚

该改动随前端代码提交发布。若出现未发现的入口路径，可回退提交；不得仅恢复部分 barrel 而不恢复相应设计和导入。

## 实际偏差和遗留问题

- 删除了 `auth`、`dictionaries`、`errors`、`home`、`menus`、`navigation`、`roles`、`users` 八个模块的全部 `index.ts`。
- 登录和错误页面新增 `auth.routes.ts`、`error.routes.ts`；动态菜单页面懒加载器并入各模块 `view-registry.ts`；菜单授权选项拆为 `menu-options.ts`。
- store 与 API 调用方直接引用 `auth.store.ts`、`navigation.store.ts`、`roles.api.ts` 等已登记公共文件，没有改变运行时行为。
- `rg --files apps/frontend/src/modules -g index.ts` 与旧模块入口引用搜索均无结果。
- 前端 Vitest 共 10 个测试文件、28 个测试通过。
- `vue-tsc && vite build` 通过；仅保留第三方依赖已有的 Vite CJS、Rollup 注释和 Sass legacy API 警告。
- 本轮未迁移后端与 API 契约包的存量入口，按 ADR-0013 留待所属模块实质修改时处理。

## 相关设计、ADR 和 AI 日志

- `docs/archive/design/module-boundaries.md`
- `docs/design/modules/frontend.md`
- `docs/decisions/ADR-0013-semantic-module-entry-files.md`
- `docs/archive/ai-logs/2026/07/2026-07-27-semantic-module-entry-files.md`
