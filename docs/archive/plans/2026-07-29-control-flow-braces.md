---
title: 控制流花括号约束
status: completed
created: 2026-07-29
updated: 2026-07-29
---

# 控制流花括号约束

## 目标

为 JavaScript、TypeScript 和 Vue 脚本建立可自动执行的完整控制流花括号约束，禁止
`if (condition) return value` 等省略花括号的写法。

## 背景与设计依据

Prettier 只统一排版，不改变控制流结构。依据
[开发工作流](../../design/developer-workflow.md)和
[ADR-0021](../../decisions/ADR-0021-source-alias-and-automated-formatting.md)，使用 ESLint flat
config 承载此静态约束，并接入根命令和 pre-commit 暂存文件流程。

## 范围

- 新增最小 ESLint 配置和开发依赖。
- 新增只读检查与自动修复命令。
- 修改已有无花括号控制语句，使全仓库通过新门禁。
- 同步开发工作流、ADR 和协作记录。

## 非目标

- 不启用与本次目标无关的 ESLint 推荐规则。
- 不创建或运行前端自动化测试。
- 不改变任何业务行为或 API 契约。

## 前置条件和风险

- 任务开始时暂存区必须为空；已于 2026-07-29 确认。
- 自动修复会触及多个源码文件，必须复查 diff，确认仅增加控制流花括号和格式化变化。
- ESLint 与 Vue/TypeScript parser 版本必须兼容当前 Node.js 和源码语法。

## 实施任务

- [x] 增加 ESLint flat config、依赖和根命令。
- [x] 把 ESLint 自动修复接入 `lint-staged`。
- [x] 修复全部存量 `curly` 违规并复查行为等价性。
- [x] 执行 lint、格式、构建和现有测试验证。
- [x] 更新最终文档、归档计划与日志并创建 AI 提交。

## 测试与验证

- `pnpm lint`
- `pnpm format`
- `pnpm format:check`
- `pnpm build`
- `pnpm test`
- 使用临时违规样例确认 `pnpm exec eslint` 会失败，修复后不会把临时文件留在仓库。

## 发布与回滚

本次只影响开发期静态检查，无运行时发布步骤。回滚时同时还原 ESLint 配置、依赖、命令、
hook 接入和文档，不单独保留失效入口。

## 实际偏差和遗留问题

ESLint 共自动修复 60 处存量违规，其中 59 处为 `if`/`else`，1 处为单行 `for...of`；复查后
均只增加花括号和必要换行，没有业务逻辑变化。

首次 `pnpm test` 中 JWT 篡改用例偶发失败，其余 62 项通过；未修改认证范围，原样重跑后
63 项全部通过。该用例通过改写 JWT 末字符制造篡改值，存在偶尔形成等价 Base64URL 编码的
既有不稳定风险，本任务不扩展处理。

最终验证通过：`pnpm lint`、违规反例检查、`pnpm format:check`、`pnpm build`、`pnpm test` 和
`git diff --check`。前端未运行自动化测试或浏览器测试，符合维护者人工验收边界；本次没有
业务行为变化，无需人工功能验收。

## 相关设计、ADR 和 AI 日志

- `docs/design/developer-workflow.md`
- `docs/decisions/ADR-0021-source-alias-and-automated-formatting.md`
- `docs/archive/ai-logs/2026/07/2026-07-29-control-flow-braces.md`
- 提交：`chore: enforce control flow braces`（本计划归档所在提交）
