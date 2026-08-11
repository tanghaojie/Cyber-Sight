---
title: 动态根路由解析修复
date: 2026-08-11
status: completed
---

# 动态根路由解析修复

## 用户目标和约束

修复默认数据库迁移首页配置为 `path = '/'`、`component = 'home'`、`layout = 'AdminLayout'` 且管理员拥有 `home.read` 时，首页动态路由未注册、点击 `/` 无反应或进入错误回退页的问题。要求处理 `dynamicRoutes.ts` 的根路径解析逻辑，并遵守仓库文档、格式、前端验证和提交门禁。

## 关键问答与确认

- 目标仓库为 `C:\Users\thj_3\Desktop\Cyber-AI-Forge`，对应文件为 `apps/frontend/src/router/dynamicRoutes.ts`。
- 当前复现链路确认为：`normalizePath('/')` 返回 `''`，`generateRoute()` 因 `if (!path) return` 跳过首页。
- 现行设计已规定数据库菜单可以把已注册页面配置为 `/` 动态根入口。

## AI 的重要假设

- 这是根路径归一化缺陷，不需要改变权限、菜单展示或根入口回退策略。
- 最小安全修复是仅对输入 `/` 返回 `/`，继续沿用其他路径的既有归一化逻辑。
- 前端自动化测试和浏览器测试不在本任务范围内，按仓库规则由维护者人工验收。

## 方案和执行摘要

已完成暂存区门禁检查、现行文档阅读和归档审计；归档审计结果为 `NOT_DUE`。已创建实施计划并更新导航设计，明确根路径不能归一化为空字符串。`dynamicRoutes.ts` 现在对 `/` 直接返回 `/`，其他路径继续沿用原逻辑。

## 验证结果

`pnpm format`、`pnpm format:check` 和 `pnpm --filter @cyber-ai-forge/frontend build` 均通过。构建仅报告既有 Sass/Rollup 分包警告；未创建或运行前端自动化/浏览器测试，按仓库规则保留人工验收边界。

## 未决问题与下一步

已完成代码修改、格式化、格式检查、前端生产构建、计划与日志归档以及带 trailer 的提交创建。

## 相关设计、ADR、计划和提交

- 设计：`docs/design/modules/navigation.md`
- 计划：`docs/archive/plans/2026-08-11-dynamic-root-route.md`
- 提交：本次修复提交已创建，并已通过 `git log -1 --format=full` 校验 trailer。
