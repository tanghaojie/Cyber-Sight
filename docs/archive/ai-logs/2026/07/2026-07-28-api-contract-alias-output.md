---
title: 修复 API 契约构建别名残留
date: 2026-07-28
status: completed
---

# 修复 API 契约构建别名残留

## 用户目标和约束

用户要求解决 `packages/api-contract` 构建后仍保留 `@` 源码别名的问题。遵守仓库 Git 门禁、
文档门禁、格式化、验证和自动提交规则。

## 关键问答与确认

无需额外确认。问题限定在契约包构建链路，不改变业务契约。

## AI 的重要假设

- 保留 ADR-0021 规定的 `@/` 源码写法，在产物阶段改写为相对 ESM specifier。
- `dist` 中观察到的残留来自开发 watch 覆盖，而不是正式 `build` 的一次性改写失效。

## 方案和执行摘要

已复现现有 `dist` 包含 `@/`，并确认单独执行正式契约构建后别名会被正确清除。根因是
`dev` 只有 `tsc --watch`。契约开发脚本现通过 pnpm 并行运行 `tsc` 与 `tsc-alias` watcher；
正式构建会递归扫描 JavaScript 和声明产物中的 `@/`，并由 Node.js 导入包入口。

## 验证结果

- 验证器能拦截纯 `tsc` 生成的 6 个别名残留文件。
- watch 模式能在纯 `tsc` 重写后自动恢复可运行产物，验证器通过。
- 契约测试、全仓 63 个后端测试、全仓生产构建和格式检查通过。
- 最终 `packages/api-contract/dist` 不含 `@/`。

## 未决问题与下一步

没有未决问题。前端功能未改动，不需要浏览器人工验收。

## 相关设计、ADR、计划和提交

- `docs/design/developer-workflow.md`
- `docs/design/modules/api-contract.md`
- `docs/decisions/ADR-0021-source-alias-and-automated-formatting.md`
- `docs/archive/plans/2026-07-28-api-contract-alias-output.md`
- 提交：本次交付提交。
