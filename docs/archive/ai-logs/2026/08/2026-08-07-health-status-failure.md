---
title: Health 模块失败状态修复
date: 2026-08-07
status: completed
---

# Health 模块失败状态修复

## 用户目标和约束

检查并修复前端 Health 模块在后端断网、超时或失败时不更新运行状态指示的问题。遵守仓库现有模块边界、文档门禁和前端不创建/运行自动化测试的约束。

## 关键问答与确认

- 根因：`fetch` 网络异常或响应解析异常未被 `useHealth` 捕获，旧状态因此保留。
- 处理范围：Health 探针捕获自身异常，并由 HTTP 客户端支持可取消请求；不修改后端契约或全局认证导航策略。
- 归档审计：任务开始时 `pnpm docs:archive:check` 返回 `DUE`，已创建对应归档审查计划。

## AI 的重要假设

- 浏览器支持 `AbortController`，且 Health 模块仅在客户端挂载后轮询。
- 5 秒是本地健康探针的合理超时；最终恢复行为仍需维护者人工验收。
- 这次修复不形成新的长期架构决策，因此不新增 ADR。

## 方案和执行摘要

已定位 `apps/frontend/src/modules/system/health/composables/useHealth.ts` 的异常处理缺口，并建立 Health 当前设计文档。共享客户端已增加 `AbortSignal` 支持，Health 已统一收敛传输/解析/业务异常并设置 5 秒超时。

## 验证结果

本任务文件已完成范围化 Prettier、`pnpm format:check` 和 Health 文件 ESLint。前端生产构建被并发的人类岗位模块 `positions.api.ts` 的既有类型错误阻塞；未修改该模块。按仓库前端边界未创建或运行自动化测试。归档账本由并发的人类岗位迁移任务更新到本任务开始后的 `de921bfc5b8415d92c1b559a6fd0436b2f9fa640`，本任务未覆盖该修改。

## 未决问题与下一步

仍需维护者人工确认停止后端后状态能在约 5 秒内显示错误，恢复后下一轮轮询能恢复 `ok`。

## 相关设计、计划与提交

- [Health 模块设计](../../../../design/modules/health.md)
- [实施计划](../../../../archive/plans/2026-08-07-health-status-failure.md)
- [归档审查计划](../../../../archive/plans/2026-08-07-health-status-failure-archive-review.md)
