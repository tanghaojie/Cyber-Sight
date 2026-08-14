---
title: 动态根路由解析修复
status: completed
created: 2026-08-11
updated: 2026-08-11
---

# 动态根路由解析修复

## 目标

修复默认数据库迁移中首页菜单路径为 `/` 时动态路由未注册的问题，确保拥有 `home.read` 的管理员可以进入并点击首页。

## 背景与设计依据

`apps/frontend/src/router/dynamicRoutes.ts` 的 `normalizePath('/')` 当前返回空字符串，随后被 `generateRoute()` 作为无效路径跳过。现行导航设计规定 `/` 是可配置的动态根入口，不能被静态默认首页或空路径替代。

## 范围

- 修复 `normalizePath` 对根路径 `/` 的解析。
- 更新导航模块设计中的路径不变量。
- 按仓库约定记录、验证并归档本次修复。

## 非目标

- 不改变菜单权限过滤、菜单原始路径展示或根入口回退顺序。
- 不新增前端自动化测试或浏览器测试；前端行为由维护者人工验收。

## 前置条件和风险

- 暂存区在任务开始时为空。
- 归档审计状态为 `NOT_DUE`。
- 主要风险是误改变非根相对/绝对路径的既有归一化行为，因此只保留根路径特判。

## 实施任务

- [x] 阅读现行设计、活动计划和动态路由实现，确认最小复现链路。
- [x] 修改 `normalizePath`，使 `/` 保持为 `/`。
- [x] 执行格式化、格式检查、前端 TypeScript 检查和生产构建。
- [x] 更新实际验证结果，归档计划与协作记录并更新索引。
- [x] 创建带真实模型 trailer 的提交并校验 trailer。

## 测试与验证

- 静态检查：`pnpm format:check`。
- 前端类型与构建：`pnpm --filter @cyber-ai-forge/frontend build`。
- 文档归档门禁：`pnpm docs:archive:check:ci`。
- 人工验收边界：登录后菜单首页 `/` 的动态路由注册、直接访问 `/`、点击首页及无首页配置时的原有回退行为。

## 发布与回滚

该修复随正常前端构建发布。若需回滚，恢复本次单文件代码改动和对应文档提交即可。

## 实际偏差和遗留问题

实现保持为单文件显式根路径特判，未改变其他路径归一化、权限过滤或根入口回退顺序。前端构建输出了既有 Sass legacy API、Rollup pure 注释、AdminLayout 动静态导入和大 chunk 警告，但没有构建失败；浏览器人工验收仍需维护者执行。

## 相关设计、ADR 和 AI 日志

- `docs/design/modules/navigation.md`
- `docs/archive/ai-logs/2026/08/2026-08-11-dynamic-root-route.md`
- 提交：本次修复提交，含真实模型 trailer。
