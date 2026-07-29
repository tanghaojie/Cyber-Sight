---
title: 控制流花括号约束
date: 2026-07-29
status: completed
---

# 控制流花括号约束

## 用户目标和约束

用户要求在项目中禁止省略花括号的行内 `if`，只使用完整的 `if (condition) { ... }` 模式。
项目规则要求新增依赖和仓库级开发行为前同步设计、计划与 AI 协作记录，并在验证后提交。

## 关键问答与确认

无需额外用户确认。仓库当前只有 Prettier，没有 ESLint；Prettier 无法执行该结构约束。

## AI 的重要假设

“完整模式”解释为 ESLint `curly: ['error', 'all']`：除 `if` 外，`else`、循环等同类控制语句
也统一要求花括号。只启用这一条目标规则，不顺带引入其他推荐规则。

## 方案和执行摘要

采用根目录 ESLint flat config，分别解析 JavaScript、TypeScript 和 Vue 脚本；增加 `lint` 与
`lint:fix` 命令，并在 `lint-staged` 中对源码先自动修复、再运行 Prettier。实施前已确认暂存区
为空，并阅读开发工作流、测试策略及 ADR-0021。ESLint 自动修复了 60 处存量 `curly` 违规；
diff 复查确认只增加花括号和必要换行。

## 验证结果

- `pnpm lint`：通过。
- 通过 stdin 注入单行无花括号 `if` 反例：ESLint 以 `curly` 错误拒绝，符合预期。
- `pnpm format:check`：通过。
- `pnpm build`：通过；沙箱内首次因 Vite/esbuild 文件系统权限失败，授权后通过。
- `pnpm test`：首次 62/63 通过，JWT 篡改用例偶发失败；原样重跑后 63/63 通过。
- `git diff --check`：通过。
- 未运行前端自动化或浏览器测试，符合仓库维护者人工验收边界。

## 未决问题与下一步

JWT 篡改测试通过替换令牌末字符制造无效签名，存在偶尔得到等价 Base64URL 编码的既有不稳定
风险。本任务未修改认证代码或测试，后续可单独改为翻转签名字节后重新编码，确保篡改值必然
不同。

## 相关设计、ADR、计划和提交

- `docs/design/developer-workflow.md`
- `docs/decisions/ADR-0021-source-alias-and-automated-formatting.md`
- `docs/archive/plans/2026-07-29-control-flow-braces.md`
- 提交：`chore: enforce control flow braces`（本日志归档所在提交）
