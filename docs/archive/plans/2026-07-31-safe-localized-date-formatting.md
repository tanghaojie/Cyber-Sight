---
title: 修复本地化日期的无效值异常
status: completed
created: 2026-07-31
updated: 2026-07-31
---

# 修复本地化日期的无效值异常

## 目标

修复健康检查时间戳尚未取得或请求失败时，侧栏调用本地化日期格式化抛出
`RangeError: Invalid time value` 并中断前端渲染的问题。

## 实施任务

- [x] 在本地化日期格式化公共边界识别无效日期并安全返回。
- [x] 侧栏仅在存在健康检查时间戳时渲染时间。
- [x] 更新本地化设计中的失败模式和验证记录。
- [x] 执行格式、Lint 和生产构建验证。
- [x] 归档计划与 AI 协作记录并创建带 AI trailer 的提交。

## 验证

- `pnpm format`
- `pnpm lint`
- `pnpm format:check`
- `pnpm build`
- 前端人工验收健康检查加载、失败和成功状态。

## 实际结果

- `formatDateTime()` 在格式化前使用 `getTime()` 校验日期，无效值返回空字符串。
- `AppSidebar` 只在健康检查返回非空时间戳后渲染时间。
- `pnpm format`、`pnpm lint`、`pnpm format:check` 和 `pnpm build` 均通过。
- 按仓库前端验证边界未运行浏览器自动化测试；仍需维护者人工确认加载、失败和成功状态。

## 相关文档

- [前端运行时多语言模块](../../design/modules/localization.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-31-safe-localized-date-formatting.md)
