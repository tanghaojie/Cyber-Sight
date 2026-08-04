---
title: 系统设置剩余项接入
status: completed
created: 2026-08-05
updated: 2026-08-05
---

# 系统设置剩余项接入

## 目标

让 Tags View、Sidebar Logo 和动态标题三个既有系统设置立即影响前端应用壳与浏览器标题。

## 背景与设计依据

`settings.store.ts` 已保存三项布尔偏好，但现有消费者只应用导航样式、主题和深色模式。设置模块、标签历史模块和前端应用壳设计已登记其边界；设置数据仍只由 `settings.store.ts` 所有，应用组合层负责消费。

## 范围

- 按 `tagsView` 显示或隐藏标签栏，并同步应用主区高度。
- 按 `sidebarLogo` 显示或隐藏侧栏品牌区，同时保留抽屉侧栏关闭入口。
- 按 `dynamicTitle` 选择动态路由标题或固定 `appConfig.name`。
- 同步相关设计、计划和 AI 协作记录。

## 非目标

- 不改变偏好默认值、存储键、持久化格式或账号级标签历史。
- 不新增前端自动化或浏览器测试。

## 前置条件和风险

设置值已通过 Store 校验并可在存储不可用时降级为内存状态。隐藏标签栏必须同时消除其预留高度；隐藏抽屉品牌区时仍需提供关闭控件。

## 实施任务

- [x] 在应用壳消费 Tags View 和 Sidebar Logo 设置。
- [x] 在启动组合层消费动态标题设置。
- [x] 格式化、执行 TypeScript 与生产构建检查，并完成文档归档和提交。

## 测试与验证

执行 `pnpm format`、`pnpm format:check`、前端 TypeScript 检查和生产构建。前端交互由维护者人工验收。

## 发布与回滚

发布随前端构建进行。回滚本次提交即可恢复三个设置仅持久化而不生效的行为。

## 实际偏差和遗留问题

无实现偏差。`pnpm format`、`pnpm format:check`、`pnpm lint` 和 `pnpm --filter @scaffold/frontend build` 均通过；构建仍输出既有 Sass 弃用及静态/动态导入提示。

## 相关设计、ADR 和 AI 日志

- [系统设置模块](../../design/modules/settings.md)
- [标签历史模块](../../design/modules/tag-view.md)
- [前端应用与应用壳](../../design/modules/frontend.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-05-settings-shell-preferences.md)
