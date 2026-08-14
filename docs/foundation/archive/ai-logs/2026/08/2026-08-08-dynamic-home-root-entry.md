---
title: 动态首页与根入口解析
date: 2026-08-08
status: completed
---

# 动态首页与根入口解析

## 用户目标和约束

用户要求首页重新通过动态菜单配置并受用户权限控制，同时为 `/` 增加可靠兜底；先评估方案，确认后要求按建议实施。遵守前端不创建或运行自动化浏览器测试的边界。

## 关键问答与确认

- 首页不再作为导航栏固定静态菜单。
- `/` 应优先使用真正可渲染的根页面，否则进入首个可导航动态页面。
- 已认证但没有动态页面时使用无权限页，不跳登录页，避免重定向循环。

## AI 的重要假设

- 后端返回的菜单树已经完成启用状态与权限过滤，并按 `sortOrder`、ID 稳定排序。
- “第一个菜单”指深度优先遍历中第一个成功生成 Vue Router 页面记录的站内 `menu`，不包括目录、外链或无效组件。
- 根入口优先级和空权限语义是长期行为，记录在 ADR-0035。

## 方案和执行摘要

先完成暂存区门禁和文档归档审计；审计结果为 `NOT_DUE`。调整静态路由、动态路由登记、认证守卫、导航组件、错误页面及应用壳菜单刷新处理。检查数据库基线后确认当前没有默认工作台菜单，因此追加幂等迁移登记 `home.read` 和 `/` 工作台；已有工作台或根页面配置不被覆盖。

## 验证结果

- `pnpm --filter @scaffold/backend test`：通过，14 个测试文件、126 项测试。
- `pnpm lint`：通过。
- `pnpm format` 与 `pnpm format:check`：通过。
- `pnpm --filter @scaffold/frontend exec vite build`：通过，包含动态工作台和无权限页产物。
- `pnpm docs:archive:check:ci`：通过，状态 `NOT_DUE`。
- `pnpm --filter @scaffold/frontend build`：最终通过。首次执行发现既有 `positions.api.ts` 联合类型收窄错误；维护者明确授权后增加 `'data' in result` 守卫并重跑成功。

## 未决问题与下一步

无。前端动态 `/`、非根首菜单回退、空权限 403、菜单权限刷新和窄屏导航仍需维护者按仓库约定人工验收。

## 相关设计、ADR、计划和提交

- [实施计划](../../../plans/2026-08-08-dynamic-home-root-entry.md)
- [前端应用与应用壳](../../../../design/modules/frontend.md)
- [前端导航](../../../../design/modules/navigation.md)
- [ADR-0035](../../../../decisions/ADR-0035-permission-controlled-root-entry.md)
- 提交：实施完成后补充。
