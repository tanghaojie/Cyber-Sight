---
title: 修复本地化日期的无效值异常
date: 2026-07-31
status: completed
---

# 修复本地化日期的无效值异常

## 用户反馈

前端侧栏运行时报错：`RangeError: Invalid time value`，调用链为
`formatDateTime()` 到 `AppSidebar.vue`。

## 原因与方案

- 健康检查初始和失败状态的时间戳是空字符串。
- `formatDateTime()` 未校验日期有效性，直接交给 `Intl.DateTimeFormat`。
- 公共格式化边界对无效日期返回空字符串，侧栏同时仅在时间戳存在时调用格式化。

## 验证结果

- `pnpm format`、`pnpm lint`、`pnpm format:check` 和完整 `pnpm build` 通过。
- 生产构建包含前端 `vue-tsc` 与 Vite 构建；保留既有非阻塞构建警告。
- 未运行仓库禁止的前端自动化或浏览器测试，人工状态验收留给维护者。

## 相关文档

- [前端运行时多语言模块](../../../../design/modules/localization.md)
- [完成计划](../../../plans/2026-07-31-safe-localized-date-formatting.md)
- 关联提交：本次无效本地化日期回归修复提交。
