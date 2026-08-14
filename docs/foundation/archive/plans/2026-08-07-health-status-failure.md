---
title: Health 模块失败状态修复
status: completed
created: 2026-08-07
updated: 2026-08-07
---

# Health 模块失败状态修复

## 目标

修复前端 Health 模块在后端断网、请求超时、响应解析失败或其他请求异常时运行状态指示不更新的问题，并保持后端恢复后的自动恢复能力。

## 背景与设计依据

`useHealth` 当前只处理 `apiClient.GET` 返回的 `error`，而浏览器 `fetch` 的网络异常和响应解析异常会直接抛出，导致旧的 `ok` 状态保留。健康探针需要一个有限的请求时限，并将所有探针异常收敛为本模块的 `error` 状态。设计记录见 [Health 模块](../../design/modules/health.md)。

## 范围

- 更新共享 HTTP 客户端，使 Health 可以传入取消信号。
- 更新 `useHealth`，处理异常、5 秒超时、错误文案和时间戳清理。
- 同步 Health 模块设计、前端设计索引和 AI 协作记录。

## 非目标

- 不改变后端 `/health` 契约。
- 不改变共享 HTTP `401`、`404`、`500` 导航策略。
- 不新增前端自动化测试或浏览器测试；按仓库前端验证边界由维护者人工验收。

## 实施任务

- [x] 定位 `useHealth` 与 HTTP 客户端的异常处理缺口。
- [x] 建立 Health 当前设计与失败模式说明。
- [x] 实现异常捕获、超时取消和失败状态同步。
- [x] 执行格式、前端构建、归档 CI 校验并检查最终 diff。
- [x] 归档本计划和 AI 协作记录。

## 验证与验收

- `pnpm format` 与 `pnpm format:check`。
- `pnpm --filter @scaffold/frontend build`。
- `pnpm docs:archive:check:ci`。
- 人工停止/恢复后端，确认侧边栏状态在约 5 秒内从 `ok` 变为错误并在恢复后下一次轮询回到 `ok`。

本次已完成本任务文件的范围化 Prettier、`pnpm format:check` 和 Health 文件 ESLint。前端生产构建被并发的人类岗位模块既有 TypeScript 错误阻塞；人工停止/恢复后端验收仍需维护者执行。

## 实际偏差与遗留问题

实现已完成。生产构建阻塞于 `apps/frontend/src/modules/system/positions/positions.api.ts` 的既有类型错误，未修改该文件；前端 Health 运行时行为仍需维护者人工验收。

## 相关设计、计划与日志

- [Health 模块设计](../../design/modules/health.md)
- [归档审查计划](2026-08-07-health-status-failure-archive-review.md)
- [AI 协作记录](../ai-logs/2026/08/2026-08-07-health-status-failure.md)
