---
title: 修复个人资料页首页导航误高亮
status: completed
created: 2026-08-05
updated: 2026-08-05
---

# 修复个人资料页首页导航误高亮

## 目标

进入个人资料页 `/account/profile` 时，首页导航入口不应显示为选中；真正处于当前菜单分支的动态菜单仍应保持正常高亮。

## 背景与设计依据

Vue Router 会将根路径 `/` 的链接视为 `/account/profile` 的祖先链接并添加 `router-link-active`。本次修复仅调整导航呈现层对静态首页入口的选中样式判定，依据导航模块设计中“首页独立于动态菜单”的约定。

## 范围

- 修改顶部导航和侧栏树中的首页入口样式判定。
- 更新导航模块设计文档，明确首页必须精确匹配。
- 不修改路由注册、菜单数据、权限过滤或个人资料页面行为。

## 非目标

- 不改变动态菜单项的父级路径高亮语义。
- 不新增前端自动化测试或浏览器测试。

## 前置条件和风险

- 首页入口继续使用静态根路由 `/`。
- 需要确认首页、个人资料页及动态子路由的高亮状态未互相影响。

## 实施任务

- [x] 定位首页误高亮的 RouterLink 包含路径行为。
- [x] 调整顶部导航和侧栏首页入口为精确路径高亮。
- [x] 更新导航设计文档和 AI 协作记录。
- [x] 执行格式化、格式检查和 TypeScript/生产构建验证。
- [x] 归档计划与 AI 协作记录并提交。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm --filter @scaffold/frontend build`（包含 `vue-tsc` 类型检查）
- 人工验收边界：`/` 高亮首页；`/account/profile` 不高亮任何导航项；动态菜单子路由仍高亮其父项。

## 发布与回滚

本次为前端样式判定修复，无数据迁移。若出现回归，回滚本次两个导航组件的样式选择器改动即可。

## 实际偏差和遗留问题

已完成顶部导航和侧栏首页入口的精确活动样式修复。`pnpm format`、`pnpm format:check` 和 `pnpm --filter @scaffold/frontend build` 均通过；生产构建中的 `vue-tsc` 也通过。构建仅报告既存的 Sass legacy API、Rollup 注释和静态/动态导入提示。未运行前端自动化或浏览器测试，按项目维护边界由维护者人工验收页面状态。

## 相关设计、ADR 和 AI 日志

- `docs/design/modules/navigation.md`
- `docs/archive/ai-logs/2026/08/2026-08-05-profile-navigation-highlight.md`
