---
title: 统一源码别名与自动格式化
status: accepted
date: 2026-07-28
---

# ADR-0021：统一源码别名与自动格式化

## 背景

各 workspace 中存在大量 `../` 与 `../../` 导入，文件移动会持续改变路径层级，也让依赖目标
不易识别。代码格式目前只保存在维护者个人 VS Code 配置中，AI、其他编辑器和 Git 提交
没有共同的可执行规范。

## 决策驱动因素

- 源码导入应稳定表达相对于 workspace `src` 的位置。
- 前端、后端、测试和发布产物必须使用一致规则且能够真实运行。
- 格式规范应进入版本控制，AI 和人类得到相同结果。
- 自动提交格式化不能无意改写本次提交范围外的文件。

## 考虑的方案

1. 保留深层相对导入与个人 VS Code 配置。无需工具变更，但重构和多参与者协作成本继续增加。
2. 只在前端配置 `@`，后端继续使用相对路径。实现简单，但仓库约定分裂。
3. 每个 TypeScript workspace 都把 `@` 映射到自己的 `src`，按执行环境补齐解析；把个人格式偏好
   固化为项目 Prettier 配置，并在编辑器、AI 验证和 pre-commit 三个入口执行。

## 决策

采用方案 3。当前目录或子目录使用 `./`；需要返回上级目录的模块导入使用 `@/`。前端
Vite/Vitest 原生登记 alias；后端和契约包由 TypeScript `paths` 提供开发期类型解析，并在
`tsc` 后运行 `tsc-alias` 生成 Node.js 可执行产物。运行时文件 URL 不伪装成模块 alias。

根目录 Prettier 配置固定 `semi: false`、`singleQuote: true`、`printWidth: 100`。VS Code
format-on-save 提供即时反馈，`lint-staged` 与 `simple-git-hooks` 在 pre-commit 只改写已暂存的
受支持文件，`format:check` 是可在 AI 和未来 CI 中复用的只读门禁。仓库文本统一使用 LF，
避免 Windows 的 Git 换行转换与 Prettier 互相覆盖。

## 正面结果

- 跨目录导入不再随调用文件深度变化，依赖目标更直观。
- 编辑器、AI、命令行和 Git 使用同一格式来源。
- 提交 hook 只处理暂存文件，保持任务边界清晰。
- Node.js 发布产物仍使用标准相对 ESM specifier，不依赖自定义生产 loader。

## 负面结果与风险

- 每个新 workspace 都需要登记自己的 `@` 解析方式。
- 后端和契约构建增加 `tsc-alias` 步骤；遗漏会得到无法直接运行的产物。
- pre-commit 会修改已暂存文件，提交前仍需查看 diff；跳过 hook 时必须靠 `format:check` 拦截。
- `@` 只表示当前 workspace 的 `src`，不能用于跨 package 导入；跨 package 仍使用正式包名。

## 验证和复审条件

- 搜索源码模块导入，不应存在以 `../` 开始的 specifier；运行时文件 URL 和测试数据字符串除外。
- `pnpm format:check`、`pnpm test` 和 `pnpm build` 通过。
- 后端与契约包构建产物不包含 `@/` specifier，后端启动入口可由 Node.js 解析。
- 若未来统一切换到原生支持 import map 的运行时或构建器，复审 `tsc-alias`，不改变源码约定。

## 相关设计和计划

- `docs/design/developer-workflow.md`
- `docs/design/modules/frontend.md`
- `docs/archive/plans/2026-07-28-source-format-and-page-components.md`
