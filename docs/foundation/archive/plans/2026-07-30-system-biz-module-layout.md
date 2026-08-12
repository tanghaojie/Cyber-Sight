---
title: 前后端系统与业务模块分层及 Header 紧凑化
status: completed
created: 2026-07-30
updated: 2026-07-30
---

# 前后端系统与业务模块分层及 Header 紧凑化

## 目标

把前后端现有模块统一迁入 `modules/system/`，创建可持久保留的 `modules/biz/`，并降低管理端 Header 的纵向占用。

## 背景与设计依据

现有模块全部是脚手架内置系统能力。依据 [ADR-0027](../../decisions/ADR-0027-system-and-business-module-classification.md)，前后端应用源码使用 `system`/`biz` 分类，共享契约路径保持不变。

## 范围

- 迁移 11 个前端模块和 8 个后端模块到 `system`。
- 更新前后端源码、后端测试、页面发现和维护文档中的路径。
- 在前后端 `modules/biz/` 增加说明文件。
- 把 `AppHeader` 高度从 `96px` 调整为 `72px`。

## 非目标

- 不迁移 `packages/api-contract` 的模块目录。
- 不改变 HTTP 路由、契约、数据库或业务规则。
- 不创建或运行前端自动化、端到端或浏览器测试。

## 前置条件和风险

- 暂存区门禁已通过，任务开始时工作区干净。
- 路径迁移必须覆盖应用组合根、模块间导入和后端测试。
- `import.meta.glob` 必须继续发现所有系统页面，并为未来业务页面保留入口。

## 实施任务

- [x] 更新现行设计并新增 ADR、活动计划和 AI 日志。
- [x] 迁移前后端模块并创建 `biz` 目录说明。
- [x] 更新全部引用和前端页面发现模式。
- [x] 缩减 Header 高度。
- [x] 执行格式、静态检查、后端测试和前后端生产构建。
- [x] 记录验证结果并归档计划与 AI 日志。

## 测试与验证

- `pnpm format`、`pnpm format:check`、`pnpm lint`：通过。
- `pnpm --filter @scaffold/api-contract build`：通过。
- `pnpm --filter @scaffold/backend test`：11 个测试文件、99 项测试通过。
- `pnpm --filter @scaffold/backend build`：通过。
- `pnpm --filter @scaffold/frontend build`：`vue-tsc` 和 Vite 生产构建通过。
- 静态检查：前后端 `modules/` 根级只包含 `system` 与 `biz`；旧导入无残留；Markdown 相对链接和 `git diff --check` 通过。
- 人工边界：未运行前端自动化或浏览器测试，Header 视觉比例由维护者人工验收。

## 发布与回滚

该变更不涉及数据迁移。需要回滚时整体撤销目录、引用、设计和 Header 高度改动。

## 实际偏差和遗留问题

- 后端测试和前端构建首次在受限沙箱中遇到 Vite/esbuild `Cannot read directory "../../../..": Access is denied`；使用同一命令在获准环境重跑后通过，未改动业务代码规避该环境问题。
- 前端构建保留既有 Sass legacy API、Rollup PURE 注释和静态/动态重复导入警告，不影响产物生成。
- 共享契约目录未迁移，符合本次前后端范围和 ADR-0027。
- 关联提交：`refactor: classify system modules and compact header`。

## 相关设计、ADR 和 AI 日志

- [系统概览](../../design/system-overview.md)
- [模块边界](../../design/module-boundaries.md)
- [ADR-0027](../../decisions/ADR-0027-system-and-business-module-classification.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-30-system-biz-module-layout.md)
