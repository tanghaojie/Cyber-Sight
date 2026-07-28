---
title: 统一前端 TypeScript 导入后缀
status: completed
created: 2026-07-29
updated: 2026-07-29
---

# 统一前端 TypeScript 导入后缀

## 目标

移除 `apps/frontend` 本地 TypeScript 模块 specifier 的 `.js` 后缀，使源码引用符合 Vite
`Bundler` 解析模型并更易阅读。

## 背景与设计依据

前端由 Vite 打包，不需要沿用 Node.js 原生 ESM 对运行时文件扩展名的要求。现行规则记录在
`docs/design/developer-workflow.md` 和 ADR-0023。

## 范围

- 修改 `apps/frontend/src` 中本地 `.ts` 模块的静态导入、导出和动态导入。
- 保留 `.vue`、第三方包和 Node.js 内置模块引用。
- 更新开发工作流、ADR、计划和 AI 协作记录。

## 非目标

- 不修改后端或共享契约包的 `.js` specifier。
- 不改变运行时行为、模块边界或前端功能。
- 不新增或运行前端自动化测试、浏览器测试。

## 前置条件和风险

- 暂存区门禁已通过。
- 风险是机械替换遗漏或误改非模块字符串，通过精确扫描与生产构建验证。

## 实施任务

- [x] 更新长期导入约定和任务文档。
- [x] 精确迁移前端本地 TypeScript 模块 specifier。
- [x] 执行格式检查、残留扫描和前端生产构建。
- [x] 复核 diff，归档计划与 AI 日志并提交。

## 测试与验证

执行 `pnpm format`、`pnpm format:check`、前端生产构建和 `.js` specifier 残留扫描。功能验收仍
由维护者人工完成。

## 发布与回滚

随普通前端构建发布；如出现解析问题，按文件恢复 `.js` 后缀并重新构建。

## 实际偏差和遗留问题

共修改 38 个前端源码文件，只移除本地 TypeScript 模块 specifier 的 `.js` 后缀。扫描确认
`.js` specifier 为 0，27 个 `.vue` specifier 保持不变；`pnpm format:check`、`git diff --check`
和前端生产构建通过。首次构建受文件系统沙箱限制，获批后使用相同命令在沙箱外通过。构建
仅输出依赖中的 Sass legacy API 与 Rollup PURE 注释警告，无本任务遗留问题。

## 相关设计、ADR 和 AI 日志

- `docs/design/developer-workflow.md`
- `docs/decisions/ADR-0023-frontend-extensionless-typescript-imports.md`
- `docs/archive/ai-logs/2026/07/2026-07-29-frontend-extensionless-imports.md`
