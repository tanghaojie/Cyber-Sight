---
title: 修复 API 契约构建别名残留
status: completed
created: 2026-07-28
updated: 2026-07-28
---

# 修复 API 契约构建别名残留

## 目标

确保 `packages/api-contract` 在正式构建和开发监听期间生成的 `dist` 都不包含 `@/` 源码别名，
并由自动化验证阻止不可被 Node.js 加载的契约产物进入交付。

## 背景与设计依据

正式 `build` 已在 `tsc` 后运行 `tsc-alias`，但 `dev` 只有 `tsc --watch`。根目录开发命令先
生成正确产物，后续契约源码变更却会由 watch 编译重新写入未改写的 `@/`，覆盖可运行产物。
现行依据为 API 契约模块设计、开发工作流和 ADR-0021。

## 范围

- 修复契约包的 watch 构建链路。
- 给正式构建增加产物别名扫描与 Node.js 入口导入验证。
- 同步当前设计与本次 AI 协作记录。

## 非目标

- 不改变源码使用 `@/` 的统一约定。
- 不改变契约 Schema、HTTP 数据结构或前后端业务行为。
- 不新增前端自动化测试。

## 前置条件和风险

- 两个 watcher 必须由跨平台的现有包管理器编排，并在任一进程退出时可观察到失败。
- 产物验证应同时覆盖文本别名残留与真实 ESM 入口解析。

## 实施任务

- [x] 并行运行 TypeScript 与别名改写 watch。
- [x] 增加契约产物验证并接入 build/test。
- [x] 执行格式、契约测试、全仓测试与构建验证。
- [x] 完成设计、计划、日志和归档索引，创建带 AI trailer 的提交。

## 测试与验证

- 纯 `tsc` 生成坏产物后，`verify:dist` 正确报告 6 个包含 `@/` 的 JavaScript 文件。
- 两个 watcher 运行时再次执行纯 `tsc`，`tsc-alias` 自动改写后 `verify:dist` 通过。
- `pnpm --filter @scaffold/api-contract test` 通过。
- `pnpm test` 通过：9 个测试文件、63 个测试全部通过。
- `pnpm build`、`pnpm format`、`pnpm format:check` 和 `git diff --check` 通过。
- 最终搜索 `packages/api-contract/dist`，未发现 `@/`。

## 发布与回滚

只影响开发和构建脚本，可通过回退本次提交恢复；不涉及数据迁移或运行时配置迁移。

## 实际偏差和遗留问题

Vitest 与 Vite 首次在受限沙箱中因 esbuild 无权读取配置路径而无法启动；同一命令在获准的
沙箱外环境重跑后通过。没有遗留功能问题。

## 相关设计、ADR 和 AI 日志

- `docs/design/developer-workflow.md`
- `docs/design/modules/api-contract.md`
- `docs/decisions/ADR-0021-source-alias-and-automated-formatting.md`
- `docs/archive/ai-logs/2026/07/2026-07-28-api-contract-alias-output.md`
- 提交：本次交付提交。
