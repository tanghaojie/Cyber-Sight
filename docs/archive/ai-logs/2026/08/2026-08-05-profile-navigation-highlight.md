---
title: 修复个人资料页首页导航误高亮
date: 2026-08-05
status: completed
---

# 修复个人资料页首页导航误高亮

## 用户目标和约束

用户要求修复进入个人资料页时首页导航错误显示为选中状态；遵守仓库文档门禁、Git 暂存区门禁和前端不创建/运行自动化浏览器测试的边界。

## 关键问答与确认

无额外问答。

## AI 的重要假设

- “导航栏”同时覆盖桌面顶部导航和窄屏/侧栏导航，因此两处首页入口保持一致行为。
- 动态菜单的祖先路径高亮是现有设计意图，仅静态首页入口需要精确匹配。

## 方案和执行摘要

根因是 Vue Router 对 `/` 使用包含路径活动判定，导致 `/account/profile` 也添加 `router-link-active`。为首页入口增加专用标识，并让其选中样式只在 `router-link-exact-active` 存在时生效；动态菜单维持原有包含路径高亮。同步更新导航设计文档和实施计划。

## 验证结果

`pnpm format`、`pnpm format:check` 和 `pnpm --filter @scaffold/frontend build` 均通过；生产构建包含 `vue-tsc` 类型检查并通过。构建仅有既存 Sass legacy API、Rollup 注释和静态/动态导入提示。

## 未决问题与下一步

无未决问题。未运行前端自动化或浏览器测试，符合项目规定的人工验收边界。记录与计划已归档，提交完成后补充提交信息。

## 相关设计、ADR、计划和提交

- 设计：`docs/design/modules/navigation.md`
- 计划：`docs/archive/plans/2026-08-05-profile-navigation-highlight.md`
- 提交：本次修复提交（最终提交包含本记录）
