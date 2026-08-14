---
title: 实现管理端 tag view
date: 2026-07-30
status: completed
---

# 实现管理端 tag view

## 用户目标和约束

用户要求在 `apps/frontend` 框架层的 `AdminLayout` 实现 tag view，持久化用户打开过的页面，并提供关闭当前、关闭其他和关闭全部。

仓库要求非简单改动先同步设计、活动计划和 AI 日志；不创建或运行前端自动化测试，完成后执行格式、lint、类型检查和生产构建，并创建带真实模型 trailer 的提交。

## 关键问答与确认

用户未指定交互样式、存储介质或关闭后的后备页面。AI 按既有管理端壳与 Pinia 技术栈直接实现，无需新增依赖。

## AI 的重要假设

- 页面以不含 query/hash 的 `route.path` 唯一标识，避免同页筛选产生重复标签和敏感查询参数落盘。
- 历史按数字用户 ID 隔离，退出登录保留磁盘历史但清除当前内存状态。
- 关闭当前优先跳转到相邻标签，无相邻项或关闭全部时回首页。
- 不可达的历史路径继续由现有 Router 404 流程处理。

## 方案和执行摘要

- 已执行暂存区门禁和工作区状态检查，均为空。
- 已通过 CodeGraph 定位 `AdminLayout`、动态路由元数据、`AppMain` 和认证 Store，并按最小阅读协议读取相关现行设计。
- 已新增 `system/tag-view` 模块：Store 校验并按账号持久化 `{ path, title }`，组件展示可横向滚动的标签与关闭操作，`AdminLayout` 负责路由同步和后备导航。
- 已把 TagView 放在 Header 与主内容之间，补充应用壳高度变量，并同步模块设计、前端设计和目录索引。

## 验证结果

- `pnpm format`、`pnpm format:check` 和 `pnpm lint` 通过。
- `pnpm --filter @scaffold/frontend build` 通过 `vue-tsc` 和 Vite 生产构建；`pnpm build` 的契约、后端和前端构建全部通过。
- Markdown 相对链接检查和 `git diff --check` 通过。
- 第一次前端构建仅因 Windows 沙箱阻止 Vite/esbuild 读取父目录而失败；获准使用原命令重跑后通过。
- 未创建或运行前端自动化、端到端或浏览器测试，符合仓库前端边界。

## 未决问题与下一步

没有阻塞性未决问题。维护者仍需在桌面端和窄屏浏览器中人工验收标签切换、刷新/重新登录恢复、三个批量关闭操作和抽屉布局。

## 相关设计、ADR、计划和提交

- [前端标签历史模块](../../../../design/modules/tag-view.md)
- [实施计划](../../../plans/2026-07-30-frontend-tag-view.md)
- 本次不新增 ADR。
- 提交：`feat(frontend): add persistent tag views`
