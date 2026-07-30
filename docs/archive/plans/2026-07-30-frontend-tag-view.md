---
title: 实现管理端 tag view
status: completed
created: 2026-07-30
updated: 2026-07-30
---

# 实现管理端 tag view

## 目标

在 `AdminLayout` 中加入可持久化的页面标签历史，支持标签切换、单项关闭、关闭当前、关闭其他和关闭全部。

## 背景与设计依据

当前应用壳只有 Header、Sidebar 和页面出口，路由已通过 `meta.title` 提供稳定标题，但没有跨页面切换历史。实现遵循[前端标签历史模块](../../design/modules/tag-view.md)、[前端应用与应用壳](../../design/modules/frontend.md)和[模块边界](../../design/module-boundaries.md)。

## 范围

- 新增 `system/tag-view` 前端模块及账号级浏览器持久化。
- 在 `AdminLayout` 组装当前路由、标签控件和关闭后的导航。
- 调整应用壳主内容高度与响应式样式。
- 同步当前设计、索引和 AI 协作记录。

## 非目标

- 不缓存页面组件实例或表单状态。
- 不持久化 query、hash、滚动位置或页面业务数据。
- 不增加后端接口、共享契约、依赖或前端自动化测试。

## 前置条件和风险

- 开始前暂存区与工作区均为空，未发现需要避让的人类未提交改动。
- 历史路由可能因权限或菜单变化失效，继续复用现有 404 行为。
- `localStorage` 可能受限或损坏，Store 必须安全降级。

## 实施任务

- [x] 实现标签 Store、持久化校验和账号隔离。
- [x] 实现标签导航组件与基础关闭操作。
- [x] 接入 `AdminLayout` 并调整 `AppMain` 高度。
- [x] 更新设计、目录索引和人工验收说明。
- [x] 完成格式、lint、类型检查、生产构建和最终 diff 检查。

## 测试与验证

- `pnpm format`、`pnpm format:check`、`pnpm lint`：通过。
- `pnpm --filter @scaffold/frontend build`：`vue-tsc` 与 Vite 生产构建通过。
- `pnpm build`：API 契约、后端和前端完整构建通过。
- Markdown 相对链接检查与 `git diff --check`：通过。
- 未创建或运行前端自动化、端到端或浏览器测试；标签切换、持久化、关闭操作和窄屏布局由维护者按设计清单人工验收。

## 发布与回滚

前端静态资源随常规构建发布。回滚提交即可移除新模块和存储读写；遗留的版本化 `localStorage` 键不会影响旧代码。

## 实际偏差和遗留问题

- 前端构建首次在受限沙箱中遇到 Vite/esbuild `Cannot read directory "../../../..": Access is denied`；使用相同命令在获准环境重跑后通过，未修改代码规避环境限制。
- 构建保留仓库既有的 Sass legacy API、Rollup PURE 注释和静态/动态重复导入警告，不影响产物生成。
- 实现按设计仅保存路径和标题，不保存 query、hash 或页面实例；没有阻塞性遗留问题。
- 关联提交：`feat(frontend): add persistent tag views`。

## 相关设计、ADR 和 AI 日志

- [前端标签历史模块](../../design/modules/tag-view.md)
- [前端应用与应用壳](../../design/modules/frontend.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-30-frontend-tag-view.md)
- 本次不新增 ADR。
