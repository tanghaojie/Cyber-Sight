---
title: 提取前端浏览器存储访问能力
status: completed
created: 2026-07-31
updated: 2026-07-31
---

# 提取前端浏览器存储访问能力

## 目标

将重复的 `browserStorage()` 提取到前端 `shared`，让认证、运行时本地化和标签历史复用同一安全访问边界。

## 背景与设计依据

三个调用点实现相同：SSR、隐私模式或存储被策略限制时返回 `null`。`shared` 允许承载领域无关的平台能力；各模块继续拥有键名、数据和写入失败时的业务降级。

## 范围

- 新增 `apps/frontend/src/shared/browserStorage.ts` 并公开 `browserStorage()`。
- 改造现有认证、localization 和 tag-view 调用点。
- 同步前端与相关模块设计，保留实施计划和 AI 协作记录。

## 非目标

- 不改变任何 `localStorage` 键、数据格式或 Cookie 策略。
- 不新增前端自动化或浏览器测试。

## 前置条件和风险

- 函数必须保持原有的 `Storage | null` 返回值和异常吞没行为，避免受限环境阻断页面运行。
- 导入路径必须符合现有 `@/*` 别名和 shared 文件组织。

## 实施任务

- [x] 定位重复实现并确认三个实现语义一致。
- [x] 建立 shared 存储访问文件并替换三个调用点。
- [x] 更新当前设计、计划和 AI 协作记录。
- [x] 执行格式化、静态检查、TypeScript 检查与生产构建。
- [x] 归档完成的计划和协作记录，并提交已验证的改动。

## 测试与验证

- `pnpm format`
- `pnpm format:check`
- `pnpm lint`
- `pnpm --filter @scaffold/frontend build`（包含 `vue-tsc`）
- 人工验收：正常浏览器可继续恢复语言和标签历史；禁用或限制 `localStorage` 时认证、语言切换和标签导航维持原有降级行为。

## 发布与回滚

无数据迁移或发布步骤。回滚时恢复各调用点的本地实现，或还原本次提交即可；浏览器既有数据不受影响。

## 实际偏差和遗留问题

实现与计划一致，没有功能偏差或遗留问题。已通过 `pnpm format`、`pnpm format:check`、
`pnpm lint` 和 `pnpm --filter @scaffold/frontend build`；生产构建仅报告既有 Sass legacy API、
VueUse PURE 注释和动态/静态导入分包提示，没有失败或本次改动相关的诊断。
关联提交：`refactor(frontend): share browser storage access`。

## 相关设计、ADR 和 AI 日志

- [前端应用与应用壳](../../design/modules/frontend.md)
- [前端运行时多语言模块](../../design/modules/localization.md)
- [前端标签历史模块](../../design/modules/tag-view.md)
- [AI 协作记录](../ai-logs/2026/07/2026-07-31-shared-browser-storage.md)
