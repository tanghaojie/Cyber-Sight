---
title: 统一前端 TypeScript 导入后缀
date: 2026-07-29
status: completed
---

# 统一前端 TypeScript 导入后缀

## 用户目标和约束

用户要求前端本地 TypeScript 引用省略 `.js` 后缀，使源码指向更干净；后端保留当前 Node ESM
写法。

## 关键问答与确认

已确认前端使用 Vite、TypeScript `ESNext` 与 `Bundler` 解析，可以安全使用无扩展名的本地
TypeScript 模块 specifier。

## AI 的重要假设

- “前端”限定为 `apps/frontend`。
- `.vue` 组件、第三方包、Node.js 内置模块和非模块字符串不在替换范围内。

## 方案和执行摘要

先登记工作流约定和 ADR，再精确修改模块 specifier，最后通过扫描、格式和前端生产构建验证。

## 验证结果

- 38 个前端源码文件完成迁移，`.js` 模块 specifier 残留为 0。
- 27 个 `.vue` 组件 specifier 保持不变。
- `pnpm format:check` 与 `git diff --check` 通过。
- `pnpm --filter @scaffold/frontend build` 通过；首次执行被文件系统沙箱阻止，获批后在沙箱外
  使用相同命令通过。
- 构建中的 Sass legacy API 和 Rollup PURE 注释提示来自现有依赖，不影响成功结果。

## 未决问题与下一步

无代码遗留问题。前端功能和浏览器行为仍由维护者按项目边界人工验收。

## 相关设计、ADR、计划和提交

- `docs/design/developer-workflow.md`
- `docs/decisions/ADR-0023-frontend-extensionless-typescript-imports.md`
- `docs/archive/plans/2026-07-29-frontend-extensionless-imports.md`
